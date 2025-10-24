# Dynamic Voting Configuration System 🎛️

## Overview
The **voting configuration system** allows admins to dynamically adjust voting duration or disable voting entirely - perfect for hackathon demos where you need to show the entire flow in minutes instead of days!

Deployed at: **bugdex.life**

## Features

### ⚡ Quick Presets for Demos
- **5 minutes** - Ultra-fast demo (0.083 hours)
- **10 minutes** - Quick demo (0.167 hours)
- **30 minutes** - Extended demo (0.5 hours)
- **1 hour** - Short testing (1 hour)
- **6 hours** - Half-day testing (6 hours)
- **1 day** - Daily voting (24 hours)
- **3 days (default)** - Production setting (72 hours)

### 🔧 Admin Controls
- Toggle voting on/off with a switch
- Set custom duration in hours (supports decimals)
- Instant apply with visual feedback
- Warning indicators for demo mode settings

## How It Works

### Database Schema
```sql
CREATE TABLE voting_config (
  id SERIAL PRIMARY KEY,
  voting_duration_hours DECIMAL(10, 3) DEFAULT 72,  -- Supports fractional hours
  voting_enabled BOOLEAN DEFAULT true,
  min_votes_required INTEGER DEFAULT 0,
  approval_threshold_percent INTEGER DEFAULT 0,
  updated_at TIMESTAMP,
  created_at TIMESTAMP
);
```

### Flow Diagram
```
Admin Dashboard → VotingConfig Component → POST /api/admin/voting-config
                                                    ↓
                                            Update database
                                                    ↓
                                            Return new config
                                                    ↓
New Submissions → GET /api/admin/voting-config → Calculate deadline
                                                    ↓
                                        voting_deadline = NOW + duration
```

## API Endpoints

### GET /api/admin/voting-config
Retrieve current voting configuration.

**Response:**
```json
{
  "success": true,
  "data": {
    "voting_duration_hours": 72,
    "voting_enabled": true,
    "min_votes_required": 0,
    "approval_threshold_percent": 0,
    "updated_at": "2025-10-23T12:00:00Z"
  }
}
```

### POST /api/admin/voting-config
Update voting configuration (admin only).

**Request Body:**
```json
{
  "voting_duration_hours": 0.083,  // 5 minutes for demo
  "voting_enabled": true,
  "admin_wallet": "0xYourAdminWallet"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Voting configuration updated",
  "data": {
    "voting_duration_hours": 0.083,
    "voting_enabled": true,
    "updated_at": "2025-10-23T12:05:00Z"
  }
}
```

**Authentication:**
- Requires `admin_wallet` in request body
- Validates against `NEXT_PUBLIC_ADMIN_WALLET` environment variable
- Returns 403 Forbidden if not authorized

## Usage Guide

### For Hackathon Demos

**Scenario:** Show complete voting flow in 5 minutes

1. **Go to Admin Dashboard** at `bugdex.life/admin`
2. **Connect admin wallet** (must match `NEXT_PUBLIC_ADMIN_WALLET`)
3. **Scroll to "Voting Configuration"** card
4. **Click "5 minutes" preset** button
5. **Click "Save Configuration"**
6. **Done!** New submissions will use 5-minute voting period

**Demo Script:**
```
1. Upload bug screenshot (1 minute)
2. Submit for voting (instant)
3. Vote from another wallet (1 minute)
4. Wait 5 minutes (show other features)
5. Auto-resolve triggers (background)
6. Mint NFT with earned rarity (1 minute)
```

### For Production

**Scenario:** Reset to 3-day production setting

1. Go to Admin Dashboard
2. Click **"3 days (default)"** preset
3. Save Configuration
4. Voting returns to normal 72-hour period

### Toggle Voting On/Off

**Use Case:** Disable voting during maintenance

1. Go to Admin Dashboard
2. Toggle **"Voting System"** switch to OFF
3. Save Configuration
4. Users will see "Voting is currently disabled" error

## Implementation Details

### VotingConfig Component
**Location:** `apps/web/components/VotingConfig.tsx`

**Features:**
- Real-time config loading
- 7 quick preset buttons (5 min → 3 days)
- Custom duration input (decimal hours)
- Enable/disable toggle switch
- Success/error message display
- Warning for demo mode (<1 hour)
- Auto-refresh after save

**Props:**
```typescript
interface VotingConfigProps {
  adminWallet: string;  // Admin wallet address for authentication
}
```

### Submit-for-Voting Endpoint Updates
**Location:** `apps/web/app/api/submit-for-voting/route.ts`

**Changes:**
```typescript
// OLD: Hard-coded 3 days
const votingDeadline = new Date(Date.now() + (3 * 24 * 60 * 60 * 1000));

// NEW: Dynamic duration from database
const config = await getVotingConfig(); // Fetches from voting_config table
const durationMs = config.voting_duration_hours * 60 * 60 * 1000;
const votingDeadline = new Date(Date.now() + durationMs);
```

**Dynamic messages:**
- "Voting is free and lasts **5 minutes**" (for 0.083 hours)
- "Voting is free and lasts **3 days**" (for 72 hours)
- "Voting is free and lasts **2 hours**" (for 2 hours)

## Database Migration

### Create Table
Run SQL script: `apps/web/scripts/create-voting-config-table.sql`

```bash
# Using psql
psql -h your-db-host -U your-user -d your-database -f apps/web/scripts/create-voting-config-table.sql

# Or run directly in Vercel Postgres dashboard
# Copy contents of create-voting-config-table.sql and execute
```

**Default values:**
- `voting_duration_hours`: 72 (3 days)
- `voting_enabled`: true
- `min_votes_required`: 0
- `approval_threshold_percent`: 0

### Verify Installation
```sql
SELECT * FROM voting_config ORDER BY updated_at DESC LIMIT 1;
```

Expected output:
```
 id | voting_duration_hours | voting_enabled | min_votes_required | approval_threshold_percent |    updated_at
----+-----------------------+----------------+--------------------+----------------------------+------------------
  1 |                    72 | t              |                  0 |                          0 | 2025-10-23 12:00
```

## Security Considerations

### Admin Authentication
- Only wallet matching `NEXT_PUBLIC_ADMIN_WALLET` can update config
- Wallet address validated in API endpoint (case-insensitive)
- Returns 403 Forbidden for unauthorized requests

### Demo Mode Warnings
- Yellow warning shown for durations <1 hour
- Clear messaging: "Not recommended for production"
- Visible time calculation: "Users will have only **5 minutes** to vote!"

### No Retroactive Changes
- ⚠️ **Important:** Changing duration only affects **NEW** submissions
- Existing pending votes keep their original deadline
- No automatic deadline updates for in-progress voting

**Example:**
```
Time: 12:00 PM - User A submits bug (3-day voting, deadline: Oct 26 12:00 PM)
Time: 12:30 PM - Admin changes to 5 minutes
Time: 12:45 PM - User B submits bug (5-minute voting, deadline: Oct 23 12:50 PM)
Result: User A's bug still resolves on Oct 26, User B's on Oct 23
```

## Testing Checklist

### Local Testing
- [ ] Create voting_config table in local database
- [ ] Set `NEXT_PUBLIC_ADMIN_WALLET` in `.env.local`
- [ ] Load `/admin` page - should show VotingConfig component
- [ ] Toggle voting on/off - should show success message
- [ ] Apply 5-minute preset - should update display
- [ ] Save config - should persist to database
- [ ] Submit bug for voting - should use new duration
- [ ] Check `voting_deadline` in database - should match calculated time

### Production Testing (bugdex.life)
- [ ] Run migration script in Vercel Postgres
- [ ] Verify environment variable: `NEXT_PUBLIC_ADMIN_WALLET`
- [ ] Deploy latest code to production
- [ ] Connect admin wallet to `/admin`
- [ ] Change duration to 10 minutes
- [ ] Submit test bug from different wallet
- [ ] Verify deadline: `SELECT voting_deadline FROM uploads WHERE id = 'test-id'`
- [ ] Vote on test bug
- [ ] Wait 10 minutes
- [ ] Check auto-resolution: `SELECT voting_status FROM uploads WHERE id = 'test-id'`

## Troubleshooting

### Config Not Loading
**Symptom:** VotingConfig shows spinner forever

**Causes:**
1. Table doesn't exist → Run migration script
2. Database connection error → Check Vercel Postgres status
3. API endpoint error → Check browser console

**Fix:**
```sql
-- Check if table exists
SELECT * FROM voting_config;

-- If empty, insert default
INSERT INTO voting_config (voting_duration_hours, voting_enabled)
VALUES (72, true);
```

### Can't Save Config
**Symptom:** "Unauthorized: Admin access required" error

**Cause:** Wallet address doesn't match `NEXT_PUBLIC_ADMIN_WALLET`

**Fix:**
1. Check environment variable in Vercel dashboard
2. Ensure wallet address is lowercase in `.env`
3. Reconnect wallet in browser
4. Verify wallet address matches exactly

### Duration Not Applying
**Symptom:** New submissions still use 3-day deadline

**Cause:** API not fetching config or fallback to default

**Debug:**
```typescript
// Add logging in submit-for-voting endpoint
console.log('Fetched config:', config);
console.log('Calculated duration (ms):', durationMs);
console.log('Deadline:', votingDeadline);
```

**Common issues:**
- Config query returns no rows → Check table
- `voting_duration_hours` is NULL → Update with default
- Deadline calculation wrong → Check hours → ms conversion

## Architecture Decisions

### Why Decimal Hours?
**Decision:** Use `DECIMAL(10,3)` instead of milliseconds

**Reasoning:**
- Human-readable: "0.083 hours" = 5 minutes (intuitive)
- Easy presets: 72 hours = 3 days (no math needed)
- Flexible: Supports fractional hours for precise demo timing
- Database-friendly: Single column, simple queries

**Alternative (rejected):** Milliseconds (less readable, harder to configure)

### Why Single Active Config?
**Decision:** Always query `ORDER BY updated_at DESC LIMIT 1`

**Reasoning:**
- Simple: No multi-config management needed
- Fast: Single row lookup with index
- Clear: Always one active configuration
- Auditable: Old configs preserved in table

**Alternative (rejected):** Active flag (more complex, no benefit)

### Why No Retroactive Updates?
**Decision:** Changing duration only affects new submissions

**Reasoning:**
- **Fairness:** Don't change rules mid-game
- **Integrity:** Users voted based on original deadline
- **Simplicity:** No complex deadline recalculation logic
- **Predictability:** Users see exact deadline upfront

**Alternative (rejected):** Auto-adjust all pending votes (unfair, confusing)

## Future Enhancements

### Planned Features
- [ ] Scheduled config changes (e.g., "demo mode from 2-4 PM")
- [ ] Per-submission duration overrides (flag specific bugs for faster voting)
- [ ] Voting analytics dashboard (average votes per hour, peak times)
- [ ] Email/webhook notifications when voting resolves
- [ ] A/B testing different durations (optimize for engagement)

### API Extensions
- [ ] `GET /api/voting-config/history` - View past configurations
- [ ] `POST /api/voting-config/schedule` - Schedule future changes
- [ ] `GET /api/voting-config/analytics` - Usage statistics

## Related Documentation
- **Mint Preview System:** `docs/MINT_PREVIEW_SYSTEM.md`
- **Off-Chain Voting:** `docs/OFFCHAIN_VOTING_COMPLETE.md`
- **Admin Dashboard:** `apps/web/app/admin/page.tsx`
- **Database Schema:** `docs/DATABASE_SETUP.md`

---

**Live Site:** https://bugdex.life  
**Admin Panel:** https://bugdex.life/admin  
**Status:** ✅ Production Ready (after migration)
