import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

import type { TranscriptRegistry } from "../typechain-types";

describe("TranscriptRegistry", function () {
  async function deployFixture() {
    const [admin, university, registrar, ministry, student, employer, outsider] = await ethers.getSigners();

  const factory = await ethers.getContractFactory("TranscriptRegistry");
  const registry = (await factory.deploy(admin.address)) as unknown as TranscriptRegistry & Record<string, any>;
    await registry.waitForDeployment();

  const UNIVERSITY_ROLE = ethers.id("UNIVERSITY_ROLE");
  const REGISTRAR_ROLE = ethers.id("REGISTRAR_ROLE");
  const MINISTRY_ROLE = ethers.id("MINISTRY_ROLE");

    await registry.connect(admin).grantRole(UNIVERSITY_ROLE, university.address);
    await registry.connect(admin).grantRole(REGISTRAR_ROLE, registrar.address);
    await registry.connect(admin).grantRole(MINISTRY_ROLE, ministry.address);

    const transcriptId = ethers.keccak256(ethers.toUtf8Bytes("transcript-1"));
    const cid = "ipfs://cid-example";
    const transcriptHash = ethers.keccak256(ethers.toUtf8Bytes("plaintext-transcript"));
    const studentKeyCipher = ethers.hexlify(ethers.randomBytes(48));
    const employerKeyCipher = ethers.hexlify(ethers.randomBytes(48));

    return {
      registry,
      accounts: { admin, university, registrar, ministry, student, employer, outsider },
      constants: { transcriptId, cid, transcriptHash, studentKeyCipher, employerKeyCipher }
    };
  }

  it("allows a university to issue a transcript and store metadata", async function () {
    const { registry, accounts, constants } = await loadFixture(deployFixture);
    const { university, student } = accounts;
    const { transcriptId, cid, transcriptHash, studentKeyCipher } = constants;

    await expect(
      registry
        .connect(university)
        .issueTranscript(transcriptId, student.address, cid, transcriptHash, studentKeyCipher)
    )
      .to.emit(registry, "TranscriptIssued")
      .withArgs(transcriptId, student.address, cid, transcriptHash, studentKeyCipher);

    const meta = await registry.getTranscriptMeta(transcriptId);
    expect(meta[0]).to.equal(student.address);
    expect(meta[1]).to.equal(cid);
    expect(meta[2]).to.equal(transcriptHash);

    const storedKey = await registry.getAccessKey(transcriptId, student.address);
    expect(storedKey).to.equal(studentKeyCipher);
  });

  it("prevents duplicate transcript issuance", async function () {
    const { registry, accounts, constants } = await loadFixture(deployFixture);
    const { university, student } = accounts;
    const { transcriptId, cid, transcriptHash, studentKeyCipher } = constants;

    await registry
      .connect(university)
      .issueTranscript(transcriptId, student.address, cid, transcriptHash, studentKeyCipher);

    await expect(
      registry
        .connect(university)
        .issueTranscript(transcriptId, student.address, cid, transcriptHash, studentKeyCipher)
    ).to.be.revertedWithCustomError(registry, "TranscriptAlreadyExists");
  });

  it("allows only the student to grant and revoke access", async function () {
    const { registry, accounts, constants } = await loadFixture(deployFixture);
    const { university, student, employer, outsider } = accounts;
    const { transcriptId, cid, transcriptHash, studentKeyCipher, employerKeyCipher } = constants;

    await registry
      .connect(university)
      .issueTranscript(transcriptId, student.address, cid, transcriptHash, studentKeyCipher);

    await expect(
      registry.connect(outsider).grantAccess(transcriptId, employer.address, employerKeyCipher)
    ).to.be.revertedWithCustomError(registry, "UnauthorizedAccess");

    await expect(
      registry.connect(student).grantAccess(transcriptId, employer.address, employerKeyCipher)
    )
      .to.emit(registry, "AccessGranted")
      .withArgs(transcriptId, employer.address, employerKeyCipher, anyValue);

    const storedEmployerKey = await registry.getAccessKey(transcriptId, employer.address);
    expect(storedEmployerKey).to.equal(employerKeyCipher);

    await expect(registry.connect(student).revokeAccess(transcriptId, employer.address))
      .to.emit(registry, "AccessRevoked")
      .withArgs(transcriptId, employer.address, anyValue);

    const revokedKey = await registry.getAccessKey(transcriptId, employer.address);
    expect(revokedKey).to.equal("0x");
  });

  it("allows the ministry to release emergency access when the student consents", async function () {
    const { registry, accounts, constants } = await loadFixture(deployFixture);
    const { university, student, employer, ministry } = accounts;
    const { transcriptId, cid, transcriptHash, studentKeyCipher, employerKeyCipher } = constants;

    await registry
      .connect(university)
      .issueTranscript(transcriptId, student.address, cid, transcriptHash, studentKeyCipher);

    await expect(registry.connect(employer).requestBreakGlass(transcriptId))
      .to.emit(registry, "BreakGlassRequested")
      .withArgs(transcriptId, employer.address, anyValue);

    await expect(
      registry.connect(ministry).releaseEmergencyAccess(transcriptId, employer.address, employerKeyCipher)
    ).to.be.revertedWithCustomError(registry, "BreakGlassNotConsented");

    await expect(registry.connect(student).setBreakGlassConsent(transcriptId, true))
      .to.emit(registry, "BreakGlassConsentUpdated")
      .withArgs(transcriptId, student.address, true, anyValue);

    await expect(
      registry.connect(ministry).releaseEmergencyAccess(transcriptId, employer.address, employerKeyCipher)
    )
      .to.emit(registry, "EmergencyAccessGranted")
      .withArgs(transcriptId, employer.address, employerKeyCipher, anyValue);

    await expect(
      registry.connect(ministry).releaseEmergencyAccess(transcriptId, employer.address, employerKeyCipher)
    ).to.be.revertedWithCustomError(registry, "BreakGlassAlreadyFulfilled");

    const [consented, requested, fulfilled] = await registry.getBreakGlassStatus(transcriptId, employer.address);
    expect(consented).to.be.true;
    expect(requested).to.be.true;
    expect(fulfilled).to.be.true;

    const storedKey = await registry.getAccessKey(transcriptId, employer.address);
    expect(storedKey).to.equal(employerKeyCipher);
  });
});
