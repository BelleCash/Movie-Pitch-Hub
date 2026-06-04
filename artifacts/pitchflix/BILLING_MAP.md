# BILLING MAP — PitchFlix
Generated: 2026-06-04

## Architecture

```
BillingContext (React)
  └── billingService (facade)
        ├── stripeProvider       ✅ Registered
        ├── paystackProvider     ✅ Registered
        ├── lemonSqueezyProvider ✅ Registered
        ├── paddleProvider       ✅ Registered
        ├── opayProvider         ✅ Registered (NEW)
        └── moniepointProvider   ✅ Registered (NEW)
```

## Provider Interface (`BillingProvider` in types.ts)

```typescript
interface BillingProvider {
  name: string;
  subscribe(tier: SubscriptionTier): Promise<SubscriptionStatus>;
  cancel(): Promise<SubscriptionStatus>;
  getSubscriptionStatus(): Promise<SubscriptionStatus>;
}
```

## Subscription Tiers

| Tier | Price | Creator Features | Investor Features |
|------|-------|-----------------|-------------------|
| free | $0/mo | Browse only | Browse only |
| starter | $9/mo | Upload pitches, dashboard, basic analytics | — |
| pro | $19/mo | Everything in Starter | Investor dashboard, deal flow, watchlist, comments |
| studio | $49/mo | Unlimited uploads, advanced analytics, featured placement | Everything in Pro + advanced analytics |

## Access Gates (roleAccess.ts)

| Access Key | Required Role | Min Tier |
|------------|--------------|----------|
| dashboard | creator | free |
| investorDashboard | investor | pro |
| createPitch | creator | starter |
| likePitch | any | free |
| comment | investor | pro |
| dealFlow | investor | pro |
| watchlist | investor | pro |
| analytics | creator | starter |
| advancedAnalytics | creator/investor | studio |
| uploadPitch | creator | starter |
| featuredPlacement | creator | studio |

## Subscription Sync Flow

1. User clicks "Upgrade" → `BillingContext.subscribe(tier)`
2. → `billingService.subscribe({ provider, tier })`
3. → Provider resolves → `SubscriptionStatus` returned
4. → `BillingContext` updates local state
5. → `lib/billing/updateSubscription.ts` writes to `profiles.subscription_tier` + auth metadata
6. → `BillingContext.syncFromSupabase()` re-reads on next mount

## Webhook Architecture (Not Yet Implemented)

Requires `api-server` artifact (server-side runtime):

| Endpoint | Provider | Purpose |
|----------|---------|---------|
| `POST /api/billing/stripe-webhook` | Stripe | subscription.created / cancelled |
| `POST /api/billing/paystack-webhook` | Paystack | charge.success / subscription.disable |
| `GET /api/billing/status` | All | Current subscription status lookup |
| `POST /api/billing/subscribe` | All | Server-side checkout session creation |

**Status:** Architecture defined. Not implemented. Requires approval + live credentials to wire.

## Live Integration Checklist (Per Provider)

To go live with any provider, replace the `mockMode: true` stub in `providers/<name>Provider.ts`:

- [ ] Stripe: Create checkout session via `/api/billing/subscribe`, handle `checkout.session.completed` webhook
- [ ] Paystack: Initialize transaction, verify on webhook `charge.success`
- [ ] LemonSqueezy: Create checkout, listen for `order_created` webhook
- [ ] Paddle: Create pay link, listen for `subscription_payment_succeeded`
- [ ] OPay: Initialize payment, verify callback
- [ ] Moniepoint: Initialize payment, verify callback
