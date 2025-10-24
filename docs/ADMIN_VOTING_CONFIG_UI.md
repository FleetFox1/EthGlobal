# Admin Dashboard - Voting Configuration Preview

## What You'll See at bugdex.life/admin

```
╔════════════════════════════════════════════════════════════════╗
║  🛡️  Admin Dashboard                                            ║
║  Manage BugDex contracts and monitor system activity           ║
║  Admin wallet: 0x1234...5678                                   ║
╚════════════════════════════════════════════════════════════════╝

┌────────────────────────────────────────────────────────────────┐
│  📊 Submission Pipeline (Off-Chain Voting)                     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [2]          [5]          [12]         [1]          [8]      │
│ Not        Pending      Approved     Rejected      Minted     │
│Submitted   Voting      Can mint NFT  Failed vote  Blockchain  │
│ (gray)     (blue)       (green)       (red)      (purple)     │
│                                                                │
│ ℹ️ Off-Chain Voting: FREE votes, 3-day period (adjustable!)   │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  ⚙️  Admin Actions                                              │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [Manage Minters]         [View All Submissions]              │
│  [Emergency Controls]                                          │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  🕐  Voting Configuration                                       │
├────────────────────────────────────────────────────────────────┤
│  Adjust voting duration or disable voting for hackathon demos  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  ⚡ Voting System                          [ON/OFF] ●──   │ │
│  │  Currently enabled                                        │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Voting Duration (hours)                                       │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  72.000                                                   │ │
│  └──────────────────────────────────────────────────────────┘ │
│  Current setting: 3 days                                       │
│                                                                │
│  Quick Presets                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│  │5 minutes│ │10 minutes│ │30 minutes│ │ 1 hour  │            │
│  │⚡ Demo  │ │⚡ Demo   │ │⚡ Demo   │ │         │            │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘            │
│                                                                │
│  ┌─────────┐ ┌─────────┐ ┌─────────────┐                     │
│  │ 6 hours │ │  1 day  │ │3 days (def.)│ ◄─ Currently Active │
│  └─────────┘ └─────────┘ └─────────────┘                     │
│                                                                │
│  ⚠️ Demo Mode: Short periods great for hackathon demos but    │
│     not recommended for production. Users will have only      │
│     5 minutes to vote!                                        │
│                                                                │
│  ℹ️ How it works: When users submit bugs for voting, the      │
│     deadline is calculated using this duration. Existing      │
│     pending votes are not affected - only new submissions.    │
│                                                                │
│  ┌──────────────────────────────────┐  ┌────────────┐        │
│  │ 💾 Save Configuration            │  │  🔄        │        │
│  └──────────────────────────────────┘  └────────────┘        │
│                                                                │
│  ✅ Configuration updated successfully!                        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Typical Hackathon Demo Workflow

### Before Your Presentation (2 minutes)
```
1. Open bugdex.life/admin
2. Connect admin wallet
3. Scroll to "Voting Configuration"
4. Click "5 minutes" preset
5. Click "Save Configuration"
6. ✅ "Configuration updated successfully!"
```

### During Your Demo (5-10 minutes)
```
MINUTE 0:
┌─────────────────────────────────────────────┐
│ 📱 "Let me show you our bug submission flow"│
│ [Upload bug screenshot]                     │
│ [Choose: Submit for Voting (FREE)]         │
│ ✅ "Voting lasts 5 minutes"                 │
└─────────────────────────────────────────────┘

MINUTE 1:
┌─────────────────────────────────────────────┐
│ 🗳️ "Community can vote for free"            │
│ [Switch to different wallet]               │
│ [Vote 👍 on the bug]                        │
│ ✅ Vote recorded!                            │
└─────────────────────────────────────────────┘

MINUTE 1-5:
┌─────────────────────────────────────────────┐
│ 💬 "While we wait, let me show you..."      │
│ - NFT card designs with holographic effects│
│ - Rarity tiers based on community votes    │
│ - PYUSD payment system                     │
│ - User profiles and achievements           │
└─────────────────────────────────────────────┘

MINUTE 5+:
┌─────────────────────────────────────────────┐
│ ⏰ Auto-resolve triggered!                   │
│ [Refresh collection page]                   │
│ ✅ Bug approved! Net votes: +1              │
│ [Click "Preview & Mint NFT"]               │
│ 🎴 Shows Uncommon card with shimmer         │
│ [Click "Mint Uncommon NFT"]                │
│ 💫 NFT minted to blockchain!                │
└─────────────────────────────────────────────┘
```

### After Your Demo (1 minute)
```
1. Return to bugdex.life/admin
2. Click "3 days (default)" preset
3. Click "Save Configuration"
4. ✅ Back to production settings
```

## Visual States

### Demo Mode Active (5 minutes)
```
┌────────────────────────────────────────────────────┐
│  🕐  Voting Configuration                          │
├────────────────────────────────────────────────────┤
│  Current setting: 5 minutes                        │
│                                                    │
│  [5 minutes] ◄─ Blue highlight                     │
│  ⚡ Demo mode                                       │
│                                                    │
│  ⚠️ YELLOW WARNING BOX:                            │
│  Demo Mode: Short voting periods are great for    │
│  hackathon demos but not recommended for          │
│  production. Users will have only 5 minutes       │
│  to vote!                                         │
└────────────────────────────────────────────────────┘
```

### Production Mode (3 days)
```
┌────────────────────────────────────────────────────┐
│  🕐  Voting Configuration                          │
├────────────────────────────────────────────────────┤
│  Current setting: 3 days                           │
│                                                    │
│  [3 days (default)] ◄─ Blue highlight              │
│                                                    │
│  ℹ️ BLUE INFO BOX:                                 │
│  How it works: When users submit bugs for voting, │
│  the deadline is calculated using this duration.  │
│  Only new submissions use the updated duration.   │
└────────────────────────────────────────────────────┘
```

### Voting Disabled
```
┌────────────────────────────────────────────────────┐
│  🕐  Voting Configuration                          │
├────────────────────────────────────────────────────┤
│  ⚡ Voting System                  ○── [OFF]       │
│  Currently disabled                                │
│                                                    │
│  [All preset buttons disabled/grayed out]          │
│                                                    │
│  ⚠️ Users will see "Voting is currently disabled"  │
└────────────────────────────────────────────────────┘
```

## User Experience Changes

### Before (Fixed 3 Days)
```
User submits bug:
┌──────────────────────────────────────────┐
│ ✅ Bug submitted for community voting!   │
│ Voting is free and lasts 3 days.        │
│ Deadline: Oct 26, 2025 12:00 PM         │
└──────────────────────────────────────────┘
```

### After Demo Mode (5 Minutes)
```
User submits bug:
┌──────────────────────────────────────────┐
│ ✅ Bug submitted for community voting!   │
│ Voting is free and lasts 5 minutes.     │
│ Deadline: Oct 23, 2025 12:05 PM         │
└──────────────────────────────────────────┘
```

### After Custom (2.5 Hours)
```
User submits bug:
┌──────────────────────────────────────────┐
│ ✅ Bug submitted for community voting!   │
│ Voting is free and lasts 2 hours.       │
│ Deadline: Oct 23, 2025 2:30 PM          │
└──────────────────────────────────────────┘
```

## Success Messages

### Configuration Saved
```
┌────────────────────────────────────────────┐
│ ✅ Configuration updated successfully!     │
│ New submissions will use 5-minute voting.  │
└────────────────────────────────────────────┘
```

### Error: Not Admin
```
┌────────────────────────────────────────────┐
│ ❌ Unauthorized: Admin access required     │
│ Your wallet doesn't match admin wallet.   │
└────────────────────────────────────────────┘
```

## Mobile View (Responsive)

```
┌─────────────────────────┐
│ 🕐 Voting Config        │
├─────────────────────────┤
│ Voting System     [ON]  │
│                         │
│ Duration (hours)        │
│ [72.000]                │
│ Current: 3 days         │
│                         │
│ Presets (stacked):      │
│ [5 minutes ⚡]          │
│ [10 minutes ⚡]         │
│ [30 minutes ⚡]         │
│ [1 hour]                │
│ [6 hours]               │
│ [1 day]                 │
│ [3 days (default)] ●    │
│                         │
│ [Save Configuration]    │
└─────────────────────────┘
```

---

**🎯 Key Points:**
- Toggle switch for quick enable/disable
- 7 preset buttons (5 min → 3 days)
- Visual feedback: blue highlight for active preset
- Warnings for demo mode (<1 hour)
- Success/error messages with auto-dismiss
- Mobile-responsive grid layout
- Real-time duration text update
- One-click save and refresh

**🚀 Ready for your hackathon demo at bugdex.life!**
