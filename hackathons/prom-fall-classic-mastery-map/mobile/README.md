# MasteryMap AI — RevenueCat Shipaton 2026 Next Gen Android build

This directory packages MasteryMap AI as an Android application with Capacitor and integrates RevenueCat for the **Pro Insights** entitlement.

## Why this branch exists

The core adaptive-learning project is also being prepared for Prom Fall Classic 2026. This branch adds a separate Android/RevenueCat layer so the educational build can independently target the RevenueCat Shipaton 2026 **Next Gen Award** without changing the Prom submission branch.

## Current stack

- Vite
- Capacitor 8.5.1
- Android
- `@revenuecat/purchases-capacitor` 13.5.0
- Bayesian Knowledge Tracing implemented locally in JavaScript
- RevenueCat Test Store for the demo purchase path

## RevenueCat model

The free learning session provides adaptive questions, mastery estimates, predicted success, and transparent recommendation reasoning.

The RevenueCat-backed entitlement is:

`pro_insights`

When active, it unlocks a personalized next-session plan based on the weakest concept, strongest concept, and current adaptive recommendation.

## Test Store setup

Create a RevenueCat project and use its built-in Test Store. Configure:

1. A Test Store product, for example `masterymap_pro_monthly`.
2. An entitlement with identifier `pro_insights`.
3. Attach the test product to that entitlement.
4. Create an Offering, make it current/default, and attach a package containing the test product.
5. Copy the **public Test Store SDK key** into a local `.env` file using `.env.example` as the template.

Do not place a RevenueCat secret REST API key in this app.

## Run in the browser

The adaptive-learning experience can be previewed without RevenueCat purchases:

```bash
npm install
npm run dev
```

## Build Android

From this `mobile` directory:

```bash
npm install
npm run android:add
```

After the first native platform creation, subsequent web changes can be synced with:

```bash
npm run android:sync
```

Open Android Studio with:

```bash
npm run android:open
```

## Verify the RevenueCat demo

On the Android debug build using the Test Store key:

1. Open MasteryMap AI and answer a question.
2. Tap **Unlock Pro Insights**.
3. Select the simulated successful Test Store purchase.
4. Confirm `pro_insights` becomes active and the personalized study plan is shown.
5. Restart the app and verify entitlement state is restored through `getCustomerInfo()`.
6. Tap **Restore** to demonstrate the explicit restore path.

Test Store transactions are sandbox/test events and do not charge real money.

## Shipaton submission checklist

- Active student status and qualifying student/academic email on Devpost.
- Parent/legal-guardian consent if required for a minor entrant.
- Public open-source repository and visible open-source license.
- Android build demonstrating meaningful RevenueCat integration.
- Public YouTube or Vimeo demo under two minutes.
- 1024×1024 app icon.
- At least one 1179×2556 screenshot without a device frame.
- Devpost text description.

## Important

The Test Store SDK key is only for development/demo builds. Do not ship a production store build configured with a Test Store API key.
