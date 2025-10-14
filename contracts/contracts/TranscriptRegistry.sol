// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title TranscriptRegistry
 * @notice Tracks encrypted academic transcripts and orchestrates access control workflows.
 * @dev Universities issue transcripts, students grant access, and break-glass approvals require dual registrar + ministry authorization.
 */
contract TranscriptRegistry is AccessControl {
    bytes32 public constant UNIVERSITY_ROLE = keccak256("UNIVERSITY_ROLE");
     bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant MINISTRY_ROLE = keccak256("MINISTRY_ROLE");

    struct TranscriptMetadata {
        address student;
        string cid;
        bytes32 transcriptHash;
        bool exists;
    }

    struct BreakGlassConsent {
        bool allowed;
        address updatedBy;
        uint64 updatedAt;
    }

    struct BreakGlassRecord {
        bool requested;
        uint64 requestedAt;
        bool fulfilled;
        uint64 fulfilledAt;
        address fulfilledBy;
    }

    mapping(bytes32 => TranscriptMetadata) private transcripts;
    mapping(bytes32 => mapping(address => bytes)) private accessKeys;
    mapping(bytes32 => BreakGlassConsent) private breakGlassConsents;
    mapping(bytes32 => mapping(address => BreakGlassRecord)) private breakGlassRecords;

    event TranscriptIssued(bytes32 indexed transcriptId, address indexed student, string cid, bytes32 transcriptHash, bytes studentKeyCiphertext);
    event AccessRequested(bytes32 indexed transcriptId, address indexed employer, uint64 requestedAt);
    event AccessGranted(bytes32 indexed transcriptId, address indexed accessor, bytes keyCiphertext, uint64 grantedAt);
    event AccessRevoked(bytes32 indexed transcriptId, address indexed accessor, uint64 revokedAt);

    event BreakGlassConsentUpdated(bytes32 indexed transcriptId, address indexed student, bool consented, uint64 updatedAt);
    event BreakGlassRequested(bytes32 indexed transcriptId, address indexed employer, uint64 requestedAt);
    event EmergencyAccessGranted(bytes32 indexed transcriptId, address indexed employer, bytes keyCiphertext, uint64 fulfilledAt);
    event BreakGlassAccess(bytes32 indexed transcriptId, address indexed accessor, string reason, string courtOrder, uint256 timestamp);

    error TranscriptAlreadyExists(bytes32 transcriptId);
    error TranscriptNotFound(bytes32 transcriptId);
    error UnauthorizedAccess(address caller);
    error BreakGlassNotRequested(bytes32 transcriptId, address employer);
    error BreakGlassNotConsented(bytes32 transcriptId);
    error BreakGlassAlreadyFulfilled(bytes32 transcriptId, address employer);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    // -----------------------------
    // Transcript issuance
    // -----------------------------
    function issueTranscript(
        bytes32 transcriptId,
        address student,
        string calldata cid,
        bytes32 transcriptHash,
        bytes calldata studentKeyCiphertext
    ) external onlyRole(UNIVERSITY_ROLE) {
        if (transcripts[transcriptId].exists) {
            revert TranscriptAlreadyExists(transcriptId);
        }

        transcripts[transcriptId] = TranscriptMetadata({
            student: student,
            cid: cid,
            transcriptHash: transcriptHash,
            exists: true
        });

        if (studentKeyCiphertext.length > 0) {
            accessKeys[transcriptId][student] = studentKeyCiphertext;
        }

        emit TranscriptIssued(transcriptId, student, cid, transcriptHash, studentKeyCiphertext);
    }

    function getTranscriptMeta(bytes32 transcriptId)
        external
        view
        returns (address student, string memory cid, bytes32 transcriptHash)
    {
        TranscriptMetadata storage meta = transcripts[transcriptId];
        if (!meta.exists) revert TranscriptNotFound(transcriptId);
        return (meta.student, meta.cid, meta.transcriptHash);
    }

    // -----------------------------
    // Student access control
    // -----------------------------
    function requestAccess(bytes32 transcriptId) external {
        if (!transcripts[transcriptId].exists) revert TranscriptNotFound(transcriptId);
        emit AccessRequested(transcriptId, msg.sender, uint64(block.timestamp));
    }

    function grantAccess(bytes32 transcriptId, address accessor, bytes calldata keyCiphertext) external {
        TranscriptMetadata storage meta = transcripts[transcriptId];
        if (!meta.exists) revert TranscriptNotFound(transcriptId);
        if (msg.sender != meta.student) revert UnauthorizedAccess(msg.sender);

        accessKeys[transcriptId][accessor] = keyCiphertext;
        emit AccessGranted(transcriptId, accessor, keyCiphertext, uint64(block.timestamp));
    }

    function revokeAccess(bytes32 transcriptId, address accessor) external {
        TranscriptMetadata storage meta = transcripts[transcriptId];
        if (!meta.exists) revert TranscriptNotFound(transcriptId);
        if (msg.sender != meta.student) revert UnauthorizedAccess(msg.sender);

        delete accessKeys[transcriptId][accessor];
        emit AccessRevoked(transcriptId, accessor, uint64(block.timestamp));
    }

    function getAccessKey(bytes32 transcriptId, address accessor) external view returns (bytes memory) {
        if (!transcripts[transcriptId].exists) revert TranscriptNotFound(transcriptId);
        return accessKeys[transcriptId][accessor];
    }

    // -----------------------------
    // Break-glass flow (Ministry only)
    // -----------------------------
    function setBreakGlassConsent(bytes32 transcriptId, bool allowed) external {
        TranscriptMetadata storage meta = transcripts[transcriptId];
        if (!meta.exists) revert TranscriptNotFound(transcriptId);
        if (msg.sender != meta.student) revert UnauthorizedAccess(msg.sender);

        BreakGlassConsent storage consent = breakGlassConsents[transcriptId];
        consent.allowed = allowed;
        consent.updatedBy = msg.sender;
        consent.updatedAt = uint64(block.timestamp);

        emit BreakGlassConsentUpdated(transcriptId, msg.sender, allowed, consent.updatedAt);
    }

    function requestBreakGlass(bytes32 transcriptId) external {
        if (!transcripts[transcriptId].exists) revert TranscriptNotFound(transcriptId);

        BreakGlassRecord storage record = breakGlassRecords[transcriptId][msg.sender];
        record.requested = true;
        record.requestedAt = uint64(block.timestamp);
        if (record.fulfilled) {
            record.fulfilled = false;
            record.fulfilledAt = 0;
            record.fulfilledBy = address(0);
        }

        emit BreakGlassRequested(transcriptId, msg.sender, record.requestedAt);
    }

    function releaseEmergencyAccess(bytes32 transcriptId, address employer, bytes calldata keyCiphertext)
        external
        onlyRole(MINISTRY_ROLE)
    {
        if (!transcripts[transcriptId].exists) revert TranscriptNotFound(transcriptId);

        BreakGlassConsent storage consent = breakGlassConsents[transcriptId];
        if (!consent.allowed) revert BreakGlassNotConsented(transcriptId);

        BreakGlassRecord storage record = breakGlassRecords[transcriptId][employer];
        if (!record.requested) revert BreakGlassNotRequested(transcriptId, employer);
        if (record.fulfilled) revert BreakGlassAlreadyFulfilled(transcriptId, employer);

        accessKeys[transcriptId][employer] = keyCiphertext;
        record.fulfilled = true;
        record.fulfilledAt = uint64(block.timestamp);
        record.fulfilledBy = msg.sender;

        emit EmergencyAccessGranted(transcriptId, employer, keyCiphertext, record.fulfilledAt);
    }

    function getBreakGlassStatus(bytes32 transcriptId, address employer)
        external
        view
        returns (
            bool consented,
            bool requested,
            bool fulfilled,
            uint64 consentedAt,
            uint64 requestedAt,
            uint64 fulfilledAt,
            address consentedBy,
            address fulfilledBy
        )
    {
        BreakGlassConsent storage consent = breakGlassConsents[transcriptId];
        BreakGlassRecord storage record = breakGlassRecords[transcriptId][employer];
        return (
            consent.allowed,
            record.requested,
            record.fulfilled,
            consent.updatedAt,
            record.requestedAt,
            record.fulfilledAt,
            consent.updatedBy,
            record.fulfilledBy
        );
    }

    // -----------------------------
    // Break-glass audit logging (Ministry only)
    // -----------------------------
    function logEmergencyAccess(
        bytes32 transcriptId,
        address accessor,
        string memory reason,
        string memory courtOrder
    ) external onlyRole(MINISTRY_ROLE) {
        if (!transcripts[transcriptId].exists) revert TranscriptNotFound(transcriptId);
        
        emit BreakGlassAccess(
            transcriptId,
            accessor,
            reason,
            courtOrder,
            block.timestamp
        );
    }
}
