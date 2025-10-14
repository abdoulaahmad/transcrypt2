# Break Glass System - Emergency Access

## Overview

The Break Glass system provides a secure emergency access mechanism for authorized ministry officials to access encrypted transcripts when legally required, while maintaining full transparency and accountability through on-chain audit logging.

## 🔑 Key Features

### 1. **Dual Key Wrapping**
When a university issues a transcript:
- AES key is wrapped for the **student** (stored on-chain)
- AES key is wrapped for the **ministry** (stored off-chain in encrypted database)

### 2. **Emergency Access Flow**
1. Ministry submits emergency access request with:
   - Transcript ID
   - Detailed reason (minimum 10 characters)
   - Optional court order reference
2. System verifies ministry authorization
3. Access is logged on-chain (immutable audit trail)
4. Student is notified immediately
5. Ministry retrieves wrapped key
6. Ministry decrypts with their MetaMask wallet

### 3. **On-Chain Audit Trail**
Every break glass access emits a `BreakGlassAccess` event containing:
- Transcript ID
- Accessor address (ministry wallet)
- Reason for access
- Court order reference (if provided)
- Timestamp

### 4. **Student Transparency**
Students can view all emergency access to their transcripts:
- Complete access history
- Timestamps and reasons
- Court order references
- Ministry wallet addresses

## 📋 API Endpoints

### Execute Break Glass
```http
POST /break-glass/execute
Content-Type: application/json

{
  "transcriptId": "0x...",
  "ministryAddress": "0x...",
  "reason": "Legal investigation pursuant to court order",
  "courtOrder": "Case #2024-12345" // optional
}
```

**Response:**
```json
{
  "status": "success",
  "wrappedKey": "0x04...",
  "message": "Emergency access granted. Student has been notified.",
  "timestamp": 1696857600000
}
```

### Get Access History (By Transcript)
```http
GET /break-glass/history/:transcriptId
```

**Response:**
```json
{
  "status": "success",
  "history": [
    {
      "transcriptId": "0x...",
      "accessor": "0x...",
      "reason": "Legal investigation",
      "courtOrder": "Case #2024-12345",
      "timestamp": 1696857600000
    }
  ],
  "count": 1
}
```

### Get Student Access History
```http
GET /break-glass/student/:address
```

**Response:**
```json
{
  "status": "success",
  "history": [...],
  "count": 2
}
```

## 🛡️ Security Features

### Authorization
- Only the configured `MINISTRY_ADDRESS` can execute break glass
- Address verification on every request
- Wallet signature required for on-chain logging

### Audit Trail
- All access logged to blockchain (immutable)
- Local database backup for quick queries
- Events queryable via web3 providers

### Student Notification
- Console logging (production: email/SMS)
- Clear notification format with all details
- Timestamp and reason included

### Transparency
- Students can view complete access history
- Public blockchain events for verification
- Court order references for legal compliance

## 🔧 Configuration

### Backend Environment Variables
Add to `.env`:
```bash
MINISTRY_ADDRESS=0x1234567890123456789012345678901234567890
```

### Smart Contract Deployment
The contract must include:
```solidity
event BreakGlassAccess(
    bytes32 indexed transcriptId,
    address indexed accessor,
    string reason,
    string courtOrder,
    uint256 timestamp
);

function logEmergencyAccess(
    bytes32 transcriptId,
    address accessor,
    string memory reason,
    string memory courtOrder
) external onlyRole(MINISTRY_ROLE);
```

## 📱 Frontend Components

### Ministry Dashboard
**BreakGlassPanel** component provides:
- Form for transcript ID, reason, court order
- Validation (minimum reason length)
- Warning banner about audit logging
- Success message with wrapped key display
- Loading states

### Student Dashboard
**AccessHistoryPanel** component shows:
- All emergency access events
- Timestamp, reason, court order
- Ministry wallet address
- Visual warning styling
- Empty state when no access recorded

## 🚀 Usage Example

### Ministry Emergency Access
```typescript
// Ministry connects wallet
const { address } = useAccount();

// Submit break glass request
const result = await api.executeBreakGlass({
  transcriptId: "0xabc...",
  ministryAddress: address,
  reason: "Legal investigation pursuant to court order #2024-12345",
  courtOrder: "Case #2024-12345"
});

// Decrypt with MetaMask
const aesKey = await decryptAesKey(result.wrappedKey, address);

// Fetch and decrypt transcript
const transcript = await api.getTranscript(transcriptId);
const decrypted = await decryptTranscript(
  transcript.ciphertext,
  transcript.iv,
  aesKey
);
```

### Student View Access History
```typescript
// Student connects wallet
const { address } = useAccount();

// Fetch access history
const history = await api.getStudentBreakGlassHistory(address);

// Display all emergency access events
history.history.forEach(access => {
  console.log(`
    Timestamp: ${new Date(access.timestamp).toLocaleString()}
    Reason: ${access.reason}
    Court Order: ${access.courtOrder || 'N/A'}
  `);
});
```

## 📊 Database Schema

### Break Glass Key Storage
```
Key: breakglass:{transcriptId}
Value: {
  wrappedKey: string,
  createdAt: number,
  accessor: "ministry"
}
```

### Access Log Storage
```
Key: breakglass:log:{transcriptId}:{timestamp}
Value: {
  transcriptId: string,
  accessor: string,
  reason: string,
  courtOrder: string,
  timestamp: number
}
```

## 🔐 Privacy Considerations

### What Ministry CAN Access
- Encrypted AES keys for any transcript
- Full transcript content after decryption
- Student identity and metadata

### What Ministry CANNOT Hide
- Every access is logged on-chain
- Students see all access events
- Blockchain events are public and permanent

### Legal Framework
- Terms of service must disclose break glass capability
- Users acknowledge ministry emergency access during signup
- Access only for: legal investigations, court orders, fraud prevention
- Court order reference recommended for all access

## 📝 Compliance

### GDPR/Privacy Laws
- Legitimate interest: legal investigations
- Transparency: students notified immediately
- Auditability: complete on-chain log
- Purpose limitation: specific reasons required

### Education Records Laws
- FERPA compliance (US): emergency exception
- Data Protection Act (UK): lawful basis documented
- Local regulations: court order recommended

## 🧪 Testing

### Test Break Glass Flow
```bash
# Start backend
cd backend
npm run dev

# In another terminal, test API
curl -X POST http://localhost:4000/break-glass/execute \
  -H "Content-Type: application/json" \
  -d '{
    "transcriptId": "test-123",
    "ministryAddress": "0x...",
    "reason": "Test emergency access for development",
    "courtOrder": "TEST-001"
  }'
```

### Verify Audit Log
```bash
# Check access history
curl http://localhost:4000/break-glass/history/test-123

# Check student history
curl http://localhost:4000/break-glass/student/0x...
```

## 🚨 Production Checklist

- [ ] Deploy updated smart contract with `logEmergencyAccess` function
- [ ] Configure `MINISTRY_ADDRESS` in backend .env
- [ ] Grant MINISTRY_ROLE to ministry wallet on-chain
- [ ] Integrate email/SMS notification service
- [ ] Set up monitoring for break glass events
- [ ] Document legal basis and privacy policy
- [ ] Train ministry staff on proper usage
- [ ] Establish court order requirements
- [ ] Configure access logging alerts
- [ ] Test end-to-end flow on testnet

## 📞 Support

For questions or issues with the break glass system:
1. Check audit logs: `/break-glass/history/:transcriptId`
2. Verify ministry address configuration
3. Check smart contract role assignments
4. Review backend logs for detailed errors

## 🔄 Future Enhancements

- [ ] Multi-signature requirement (Ministry + Registrar)
- [ ] Time-locked access (7-day waiting period)
- [ ] Student appeal mechanism
- [ ] Automated court order verification
- [ ] Email/SMS integration
- [ ] Access analytics dashboard
- [ ] Rate limiting and abuse prevention
- [ ] Encrypted reason field (decrypt only with court order)
