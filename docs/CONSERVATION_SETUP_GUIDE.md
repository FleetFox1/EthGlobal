# Conservation Donation System - Setup Guide

## ✅ What's Been Created

### Pages
1. **`/conservation`** - Education page about bug conservation (existing, now with donate button)
2. **`/donate`** - NEW! PYUSD donation and voting interface

### API Endpoints
- `GET /api/conservation/organizations` - List orgs with vote counts
- `POST /api/conservation/donate` - Record PYUSD donation
- `GET /api/conservation/donate?quarter=2025-Q4` - List donations
- `POST /api/conservation/vote` - Cast weighted vote
- `GET /api/conservation/has-voted?wallet=0x...&quarter=2025-Q4` - Check vote status

### Database
- SQL migration ready: `apps/web/scripts/create-conservation-system.sql`
- 4 tables: conservation_orgs, conservation_donations, conservation_votes, conservation_distributions
- Sample data: 4 conservation organizations included

## 🚀 Next Steps to Deploy

### 1. Run Database Migration

**In Neon SQL Editor:**
```sql
-- Copy and paste contents of apps/web/scripts/create-conservation-system.sql
-- Verify with:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'conservation_%';
```

### 2. Set Environment Variables in Vercel

```env
# Create a secure wallet for conservation donations
NEXT_PUBLIC_CONSERVATION_WALLET=0xYourSecureWalletAddress

# BUG token address (for voting weight)
NEXT_PUBLIC_BUG_TOKEN_ADDRESS=0xYourBugTokenAddress

# PYUSD address (already set)
NEXT_PUBLIC_PYUSD_ADDRESS=0x9Cc4DA42fE6d04628F85E6C2078A6f0e6b50B69C
```

### 3. Test Locally

```bash
cd apps/web
pnpm dev
```

Visit:
- http://localhost:3000/conservation (see "Donate to Conservation" button)
- http://localhost:3000/donate (test donation & voting interface)

### 4. Deploy

```bash
git add .
git commit -m "feat: Add conservation donation system with PYUSD and quarterly voting"
git push origin main
```

Vercel will auto-deploy!

## 🧪 Testing Checklist

### After Database Migration:
- [ ] Visit `/donate` page - should load without errors
- [ ] Check organizations display (4 orgs from sample data)
- [ ] Verify current quarter shows (2025-Q4)
- [ ] Stats show "Total Donated: $0.00"

### With Wallet Connected:
- [ ] BUG balance displays correctly
- [ ] Can enter donation amount
- [ ] "Donate" button active when wallet connected
- [ ] Vote section shows "Select an organization"

### Donation Flow:
- [ ] Enter amount (e.g., $5)
- [ ] Click "Donate $5 PYUSD"
- [ ] MetaMask prompts for PYUSD transfer
- [ ] Transaction confirms
- [ ] Success message shows
- [ ] Total donated increases

### Voting Flow:
- [ ] Click on an organization card (highlights green)
- [ ] Click "Submit Vote" button
- [ ] Success message: "Vote submitted!"
- [ ] Vote count updates immediately
- [ ] Button changes to "Already Voted This Quarter"
- [ ] Can't vote again until next quarter

## 📊 User Journey

### Flow 1: Learn → Donate
```
User visits /conservation
  ↓
Reads about bug conservation crisis
  ↓
Clicks "Donate to Conservation" button
  ↓
Lands on /donate page
  ↓
Donates PYUSD
```

### Flow 2: Donate → Vote
```
User donates $10 PYUSD
  ↓
Scrolls down to voting section
  ↓
Selects "Ocean Conservancy"
  ↓
Submits vote (weighted by BUG balance)
  ↓
Vote recorded for Q4 2025
```

### Flow 3: Quarterly Distribution (Admin)
```
Quarter ends (Dec 31, 2025)
  ↓
Admin queries winning org (highest weighted votes)
  ↓
Admin sends 100% of PYUSD from conservation wallet
  ↓
Records distribution transaction
  ↓
New quarter begins, voting resets
```

## 🎬 Demo Script for PYUSD Prize

**30-second segment in 3-minute video:**

> "But BugDex goes beyond bug bounties. Our community can donate PYUSD directly to conservation organizations. [Shows /donate page]
>
> Every quarter, BUG token holders vote on which organization receives the funds. Your vote is weighted by how many tokens you hold—completely fair and transparent.
>
> Watch: I'll donate $5 PYUSD... [clicks donate, signs transaction] Done!
>
> Now I can vote for Ocean Conservancy... [selects org, submits vote] Perfect!
>
> Everything is on-chain. Anyone can verify donations on Etherscan. [clicks transparency link]
>
> This shows PYUSD isn't just for payments—it enables real social impact with full transparency."

## 🏆 Prize Strengthening

This system demonstrates:

✅ **Core PYUSD Use Case**: Payments (bounties) + Donations (philanthropy)  
✅ **Consumer UX**: Simple donation flow, no gas fees shown to user  
✅ **Social Impact**: Real conservation funding, real organizations  
✅ **Community Governance**: BUG token voting, weighted by stake  
✅ **Transparency**: All transactions on-chain, Etherscan links  
✅ **Quarterly Engagement**: Sustained community participation  

**Key Differentiator**: Production app showing PYUSD enables both commerce AND social good!

## 📝 Organizations in Database

1. **Ocean Conservancy** (ocean) - Marine ecosystem protection
2. **World Wildlife Fund** (wildlife) - Global species conservation
3. **Rainforest Alliance** (forest) - Tropical forest preservation
4. **The Nature Conservancy** (climate) - Biodiversity and climate action

Users vote quarterly, winning org gets 100% of donations!

## 🔧 Maintenance Tasks

### Quarterly (Every 3 months):
1. Calculate winning organization
2. Transfer PYUSD from conservation wallet
3. Record distribution in database
4. Announce winner to community
5. Reset for next quarter

### Ongoing:
- Monitor donation wallet balance
- Respond to community questions
- Add new verified organizations as needed
- Publish quarterly transparency reports

## 🆘 Troubleshooting

**"Organizations not loading"**
→ Run database migration first

**"Insufficient PYUSD balance"**
→ User needs PYUSD in wallet, get from faucet or swap

**"Must hold BUG tokens to vote"**
→ User needs to earn BUG by submitting bugs or buying tokens

**"Already voted this quarter"**
→ Expected behavior, one vote per wallet per quarter (resets Q1/Q2/Q3/Q4)

**"Transaction failed"**
→ Check user has enough ETH for gas, PYUSD approval, correct network (Sepolia)

## ✨ Future Enhancements

- [ ] Smart contract for automated quarterly distributions
- [ ] Multi-sig for conservation wallet security
- [ ] Donation leaderboard (top donors)
- [ ] Organization profiles with impact reports
- [ ] Email notifications when quarter voting opens
- [ ] Mobile-optimized donation flow
- [ ] Integration with ENS for donation receipts

---

**System Status:** Ready for database migration and deployment! 🌍

**Estimated Setup Time:** 30 minutes  
**Testing Time:** 30 minutes  
**Total:** 1 hour to production

**Files Ready:**
- ✅ Frontend UI (`/donate` page)
- ✅ API endpoints (4 routes)
- ✅ Database schema (SQL migration)
- ✅ Documentation (this file + CONSERVATION_SYSTEM_COMPLETE.md)
- ✅ Integration (conservation page links to donate)

**Let's save some bugs! 🐛💚**
