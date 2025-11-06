# WEE5 - Quick Start Guide

**Status:** 🟡 Code Complete - Setup Required  
**Time to Production:** 2-3 hours

---

## 🚀 Quick Setup (5 Steps)

### 1. Install Dependencies (5 min)
```bash
cd wee5-app
pnpm add whop-sdk-ts ws
pnpm add -D @types/ws
```

### 2. Create Bot User (30 min)
1. Go to https://business.whop.com
2. Create new user account (email: `wee5-bot@yourdomain.com`)
3. Get user ID (format: `user_xxxxxxxxxxxx`)
4. Generate OAuth token
5. Add bot to your communities

**Detailed Guide:** See `UNDERSTANDING_BOTUSER.MD`

### 3. Configure Environment (15 min)
```bash
cp .env.example .env.local
```

Edit `.env.local` and add:
```env
WHOP_API_KEY=your_api_key
WHOP_BOT_USER_ID=user_xxxxxxxxxxxx
WHOP_BOT_TOKEN=oauth_token
```

**Full Template:** See `.env.example`

### 4. Start Development (1 min)
```bash
pnpm dev
```

Check console for:
```
✅ Connected to Whop WebSocket
📡 Subscribed to community events
```

### 5. Test Integration (30 min)
1. Send message in community
2. Verify XP awarded < 2 seconds
3. Check database update
4. Test level-up rewards

**Testing Guide:** See `WHOP_INTEGRATION_SETUP.MD` Step 7

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **IMPLEMENTATION_SUMMARY.MD** | What was done |
| **WHOP_INTEGRATION_SETUP.MD** | Detailed setup guide |
| **DOCUMENTATION_VS_PRODUCT_REPORT.MD** | Gap analysis |
| **WHOP_IMPLEMENTATION_PROGRESS.MD** | Progress tracking |

---

## ✅ Checklist

- [ ] Dependencies installed
- [ ] Bot user created
- [ ] Environment configured
- [ ] WebSocket connected
- [ ] XP awarding tested
- [ ] Rewards tested
- [ ] Notifications tested

---

## 🆘 Troubleshooting

**WebSocket not connecting?**
- Check `WHOP_BOT_TOKEN` is correct
- Verify bot user has OAuth token
- Ensure bot is in communities

**XP not awarding?**
- Check WebSocket connection status
- Verify cooldown isn't blocking
- Check Redis connection

**Rewards not delivering?**
- Verify `WHOP_API_KEY` permissions
- Check user has active membership
- Review Whop API logs

**Full Guide:** See `WHOP_INTEGRATION_SETUP.MD` Troubleshooting section

---

## 🎯 Success Indicators

✅ Console shows: "Connected to Whop WebSocket"  
✅ User sends message → XP awarded in < 2 seconds  
✅ User levels up → Free days added automatically  
✅ User receives push notification  
✅ Leaderboard updates in real-time

---

**Next Step:** Run `pnpm add whop-sdk-ts ws` 🚀
