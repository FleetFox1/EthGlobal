# 🔍 Blockscout Custom Explorer Deployment

## Prize Target: Blockscout Autoscout ($3,500)

### Status: ⏳ Waiting for Credits Approval

**Account Created:** ✅ deploy.blockscout.com  
**Credits Requested:** ✅ Via ETHGlobal Discord  
**Awaiting:** Credits approval email  

---

## Deployment Steps (Once Credits Approved)

### 1. Access Blockscout Platform (2 minutes)

```
1. Check email for Blockscout credits approval
2. Visit: https://deploy.blockscout.com
3. Login with your account
4. Verify credits balance in top-right corner
```

### 2. Create New Instance (3 minutes)

**Basic Settings:**
- **Network:** Sepolia Testnet
- **Instance Name:** BugDex Explorer
- **Subdomain:** bugdex (will be bugdex.blockscout.com)

**Advanced Settings (Optional):**
- **Custom RPC:** Use Alchemy/Infura endpoint if needed
- **Enable APIs:** ✅ All APIs enabled
- **Rate Limiting:** Default (100 req/min)

**Branding:**
- **Logo:** Upload BugDex logo (512x512px recommended)
- **Primary Color:** #10b981 (your brand green)
- **Secondary Color:** #000000 (black)
- **Favicon:** BugDex bug icon

**Click "Deploy Instance"** (takes 2-3 minutes to spin up)

### 3. Get Your Custom URL

After deployment, you'll get:
```
https://bugdex.blockscout.com
or
https://sepolia-bugdex.blockscout.com
```

**Test it immediately:**
```
1. Visit the URL
2. Search for a known Sepolia address
3. Verify your branding appears
4. Check contract verification works
```

### 4. Update Environment Variables

Add to `.env.local` and Vercel:
```env
NEXT_PUBLIC_BLOCKSCOUT_URL=https://bugdex.blockscout.com
```

**Deploy to Vercel:**
```powershell
# Update environment variable in Vercel dashboard
# Or redeploy to pick up changes
git add .env.local
git commit -m "feat: Add Blockscout custom explorer"
git push origin main
```

### 5. Integrate into BugDex App (10 minutes)

**File:** `apps/web/lib/blockscout.tsx` (already created ✅)

**Usage Examples:**

**A. Admin Dashboard - Add explorer links to stats:**
```tsx
import { BlockscoutLink, AddressWithLink } from '@/lib/blockscout';

// In apps/web/app/admin/page.tsx
<div className="space-y-2">
  <p>BugNFT Contract:</p>
  <AddressWithLink address={nftAddress} showFull />
  
  <p>BugToken Contract:</p>
  <AddressWithLink address={tokenAddress} showFull />
</div>
```

**B. Collection Page - Add NFT explorer links:**
```tsx
import { BlockscoutLink } from '@/lib/blockscout';

// In apps/web/app/collection/page.tsx
<BlockscoutLink 
  type="nft" 
  value={nftContractAddress} 
  tokenId={bug.token_id}
>
  View on Explorer
</BlockscoutLink>
```

**C. Conservation Page - Show donation transparency:**
```tsx
import { TxHashWithLink } from '@/lib/blockscout';

// In apps/web/app/donate/page.tsx
<div className="text-sm text-gray-500">
  Transaction: <TxHashWithLink txHash={donation.txHash} />
</div>
```

**D. Wallet Connection - Show user address:**
```tsx
import { AddressWithLink } from '@/lib/blockscout';

// In header/wallet component
{address && (
  <AddressWithLink address={address} />
)}
```

### 6. Replace All Etherscan Links (5 minutes)

**Find and replace throughout codebase:**

Before:
```tsx
https://sepolia.etherscan.io/tx/${txHash}
```

After:
```tsx
import { getTransactionUrl } from '@/lib/blockscout';
{getTransactionUrl(txHash)}
```

**Files to update:**
- ✅ `lib/blockscout.tsx` (already done)
- 🔲 `app/admin/page.tsx` (add contract links)
- 🔲 `app/collection/page.tsx` (add NFT explorer links)
- 🔲 `app/donate/page.tsx` (add donation tx links)
- 🔲 `components/WalletConnect.tsx` (add address link)

### 7. Documentation & Screenshots (5 minutes)

**Take screenshots for prize submission:**
1. Custom branded homepage with BugDex logo
2. BugNFT contract page showing verified code
3. Example NFT token page with metadata
4. Transaction page showing PYUSD donation
5. Address page showing BUG token balance

**Add to README.md:**
```markdown
## 🔍 Custom Blockchain Explorer

BugDex uses a custom Blockscout instance for enhanced transparency:
- **Explorer URL:** https://bugdex.blockscout.com
- **Features:** Verified contracts, NFT metadata, real-time transactions
- **Integration:** All contract interactions link to our explorer
```

### 8. Prize Submission Content

**What to highlight:**
- ✅ Custom branded explorer (BugDex colors/logo)
- ✅ Integrated throughout app (admin, collection, donations)
- ✅ Enhanced transparency (all txs/contracts linkable)
- ✅ Professional UX (users see branded explorer, not generic Etherscan)
- ✅ Production deployment (live at bugdex.life)

**Video/Demo points:**
1. Show custom explorer homepage
2. Click "View on Explorer" from BugDex app
3. Show verified contracts with your branding
4. Navigate NFT metadata/images
5. Explain how it enhances user trust

---

## Troubleshooting

**If credits not approved:**
- Check spam folder for approval email
- Ping ETHGlobal team again in Discord
- **Backup plan:** Purchase minimum credits (~$50) to demo tomorrow

**If deployment fails:**
- Verify Sepolia is selected (not mainnet)
- Check credit balance is sufficient
- Try simpler configuration (no custom RPC)
- Contact Blockscout support via Discord

**If branding doesn't appear:**
- Re-upload logo (try different format: PNG vs SVG)
- Clear browser cache
- Wait 5 minutes for CDN propagation
- Check logo URL in instance settings

---

## Cost Estimate

**For hackathon demo:**
- Sepolia deployment: ~$10-20 in credits
- 1-2 days runtime: Minimal ongoing cost
- Should be covered by ETHGlobal credits

**If purchasing credits:**
- Minimum purchase: ~$50
- Covers deployment + 1 week runtime
- More than enough for hackathon demo

---

## Alternative (If Credits Don't Come)

**Keep using Etherscan BUT:**
1. Still use the helper functions from `lib/blockscout.tsx`
2. They'll point to Etherscan for now
3. Easy to swap URL later once credits arrive
4. Document the integration in prize submission

**Prize submission angle:**
- "Built integration infrastructure for custom explorer"
- "Ready to deploy once credits approved"
- "Show the code/implementation even if not deployed yet"

---

## Next Steps

- [ ] Check email/Discord for Blockscout approval
- [ ] Deploy instance once credits received
- [ ] Update NEXT_PUBLIC_BLOCKSCOUT_URL environment variable
- [ ] Add explorer links to admin dashboard
- [ ] Add explorer links to collection page
- [ ] Add explorer links to donation page
- [ ] Take screenshots for prize submission
- [ ] Record demo video showing custom explorer
- [ ] Update README with explorer URL

**Time estimate:** 25 minutes total once credits approved
**Priority:** HIGH - $3,500 prize, easy implementation
