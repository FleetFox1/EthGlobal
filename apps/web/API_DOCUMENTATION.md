# 🔌 BugDex API Documentation

Backend API for BugDex - Handles IPFS uploads, blockchain interactions, and data queries.

---

## 🚀 Quick Start

### Prerequisites
1. Deployed smart contracts (addresses in `.env`)
2. Lighthouse API key
3. RPC endpoint (local Hardhat or testnet)

### Environment Variables
Create `.env.local`:
```bash
LIGHTHOUSE_API_KEY=your_key_here
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_BUG_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_BUG_NFT_ADDRESS=0x...
NEXT_PUBLIC_BUG_VOTING_ADDRESS=0x...
PRIVATE_KEY=your_backend_private_key
```

---

## 📋 API Endpoints

### 1. Submit Bug
**POST** `/api/submit-bug`

Submit a new bug for community voting.

**Request** (multipart/form-data):
```typescript
{
  image: File,              // Bug image (required)
  species: string,          // Bug species (optional)
  location: string,         // Discovery location (optional)
  description: string,      // Description (optional)
  rarity: number,           // 0-4 (required)
  userAddress: string       // Wallet address (required)
}
```

**Response**:
```json
{
  "success": true,
  "message": "Bug submitted successfully for voting",
  "data": {
    "submissionId": 1,
    "imageCID": "Qm...",
    "imageURL": "https://gateway.lighthouse.storage/ipfs/Qm...",
    "metadataCID": "Qm...",
    "metadataURL": "https://gateway.lighthouse.storage/ipfs/Qm...",
    "txHash": "0x...",
    "votingDeadline": 1696543200000
  }
}
```

**Example**:
```typescript
const formData = new FormData();
formData.append("image", imageFile);
formData.append("species", "Ladybug");
formData.append("location", "San Francisco, CA");
formData.append("rarity", "2");
formData.append("userAddress", "0x...");

const response = await fetch("/api/submit-bug", {
  method: "POST",
  body: formData,
});
```

---

### 2. Vote on Submission
**POST** `/api/vote`

Validate and prepare for voting on a submission.

**Note**: Actual vote transaction is signed and sent from client wallet.

**Request** (JSON):
```json
{
  "submissionId": 1,
  "userAddress": "0x...",
  "voteFor": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Ready to vote",
  "data": {
    "submission": {
      "id": 1,
      "ipfsHash": "Qm...",
      "submitter": "0x...",
      "votesFor": 2,
      "votesAgainst": 0,
      "createdAt": 1696370000,
      "votingDeadline": 1696629200,
      "timeRemaining": 259200
    },
    "votingConfig": {
      "stakeAmount": "10",
      "threshold": 5,
      "reward": "5"
    },
    "instructions": {
      "step1": "Approve BUG token spending",
      "step2": "Call vote() function on voting contract"
    }
  }
}
```

**Client-side voting**:
```typescript
// Step 1: Approve BUG token
const bugToken = new ethers.Contract(BUG_TOKEN_ADDRESS, BUG_TOKEN_ABI, signer);
await bugToken.approve(VOTING_ADDRESS, ethers.parseEther("10"));

// Step 2: Vote
const voting = new ethers.Contract(VOTING_ADDRESS, VOTING_ABI, signer);
await voting.vote(submissionId, true); // true = approve, false = reject
```

---

### 3. Get Submissions
**GET** `/api/submissions`

Fetch active submissions or specific submission details.

**Query Parameters**:
- `id` (optional): Specific submission ID
- `status` (optional): "active" (default) | "all"

**Examples**:
```
GET /api/submissions                  // All active submissions
GET /api/submissions?id=1             // Specific submission
GET /api/submissions?status=active    // Active submissions
```

**Response** (single submission):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "submitter": "0x...",
    "ipfsHash": "Qm...",
    "metadataURL": "https://gateway.lighthouse.storage/ipfs/Qm...",
    "createdAt": 1696370000,
    "votesFor": 3,
    "votesAgainst": 0,
    "resolved": false,
    "approved": false,
    "nftTokenId": 0,
    "rarity": 2,
    "votingDeadline": 1696629200,
    "timeRemaining": 259200,
    "status": "active",
    "progress": {
      "votesFor": 3,
      "votesAgainst": 0,
      "total": 3,
      "threshold": 5,
      "percentageFor": 100
    }
  }
}
```

**Response** (list):
```json
{
  "success": true,
  "count": 5,
  "data": [
    { /* submission 1 */ },
    { /* submission 2 */ },
    ...
  ]
}
```

---

### 4. Get User Profile
**GET** `/api/user/[address]`

Fetch user's collection, stats, and BUG balance.

**Example**:
```
GET /api/user/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Response**:
```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "balance": {
      "bug": "150.5"
    },
    "stats": {
      "totalBugs": 12,
      "verifiedBugs": 10,
      "totalVotesReceived": 54,
      "rarityBreakdown": {
        "common": 5,
        "uncommon": 4,
        "rare": 2,
        "epic": 1,
        "legendary": 0
      }
    },
    "collection": [
      {
        "tokenId": 1,
        "ipfsHash": "Qm...",
        "metadataURL": "https://...",
        "rarity": 0,
        "rarityName": "Common",
        "discoverer": "0x...",
        "discoveryTime": 1696370000,
        "voteCount": 5,
        "verified": true
      },
      ...
    ]
  }
}
```

---

## 🔧 Utility Functions

### IPFS Functions (`lib/lighthouse.ts`)

```typescript
// Upload file to IPFS
uploadFileToIPFS(buffer: Buffer, fileName: string)
  → { cid: string, url: string }

// Upload text/JSON to IPFS
uploadTextToIPFS(content: string, fileName?: string)
  → { cid: string, url: string }

// Upload bug metadata
uploadBugMetadata(metadata: BugMetadata)
  → { cid: string, url: string }

// Get IPFS URL from CID
getIPFSUrl(cid: string) → string

// Extract CID from IPFS URL
extractCID(ipfsUrl: string) → string
```

### Contract Functions (`lib/contracts.ts`)

```typescript
// Get contract instances
getBugTokenContract(signer?)
getBugNFTContract(signer?)
getBugVotingContract(signer?)

// Submit bug (server-side)
submitBugToVoting(ipfsHash: string, rarity: number)
  → { submissionId: number, txHash: string }

// Query functions
getSubmissionDetails(id: number)
getActiveSubmissions()
getBugBalance(address: string)
getUserNFTs(address: string)
```

---

## 🔄 Complete Flow Example

### Frontend to Backend Integration

```typescript
// 1. User selects bug image
const imageFile = e.target.files[0];

// 2. Submit to backend API
const formData = new FormData();
formData.append("image", imageFile);
formData.append("species", "Ladybug");
formData.append("location", "Garden");
formData.append("rarity", "1");
formData.append("userAddress", walletAddress);

const response = await fetch("/api/submit-bug", {
  method: "POST",
  body: formData,
});

const result = await response.json();
console.log("Submitted:", result.data.submissionId);

// 3. Other users vote
const voteResponse = await fetch("/api/vote", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    submissionId: result.data.submissionId,
    userAddress: voterAddress,
    voteFor: true,
  }),
});

// 4. Sign and send vote transaction from client
const votingContract = new ethers.Contract(
  VOTING_ADDRESS,
  VOTING_ABI,
  signer
);
await votingContract.vote(submissionId, true);

// 5. Check if approved and minted
const submissionData = await fetch(
  `/api/submissions?id=${submissionId}`
).then(r => r.json());

if (submissionData.data.resolved && submissionData.data.approved) {
  console.log("NFT Minted! Token ID:", submissionData.data.nftTokenId);
}

// 6. View user's collection
const userData = await fetch(`/api/user/${userAddress}`)
  .then(r => r.json());
console.log("Collection:", userData.data.collection);
```

---

## 🧪 Testing Locally

### 1. Deploy Contracts
```bash
cd apps/contracts

# Terminal 1: Start local node
pnpm run node

# Terminal 2: Deploy
pnpm run deploy:local
```

### 2. Update Environment
Copy contract addresses from deployment output to `.env.local`:
```
NEXT_PUBLIC_BUG_TOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_BUG_NFT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_BUG_VOTING_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

### 3. Start Dev Server
```bash
cd apps/web
pnpm dev
```

### 4. Test API with curl

**Submit Bug**:
```bash
curl -X POST http://localhost:3000/api/submit-bug \
  -F "image=@bug.jpg" \
  -F "species=Ladybug" \
  -F "location=Garden" \
  -F "rarity=1" \
  -F "userAddress=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
```

**Get Submissions**:
```bash
curl http://localhost:3000/api/submissions
curl http://localhost:3000/api/submissions?id=1
```

**Get User Data**:
```bash
curl http://localhost:3000/api/user/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

---

## 🛡️ Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common Error Codes**:
- `400` - Invalid request (missing fields, validation failure)
- `500` - Server error (IPFS upload failed, contract error)

---

## 🔐 Security Considerations

1. **Private Keys**: Never expose `PRIVATE_KEY` in client-side code
2. **Rate Limiting**: Implement rate limiting for API endpoints
3. **File Validation**: Validate image types and sizes
4. **Address Validation**: Always validate Ethereum addresses
5. **Signature Verification**: Consider adding signature-based auth for sensitive endpoints

---

## 📝 Next Steps

- [ ] Add rate limiting middleware
- [ ] Implement signature-based authentication
- [ ] Add caching for submission queries
- [ ] Add pagination for large datasets
- [ ] Add WebSocket for real-time vote updates
- [ ] Add image optimization before IPFS upload
- [ ] Add metadata validation schema

---

**Built for ETHGlobal 2025** 🚀
