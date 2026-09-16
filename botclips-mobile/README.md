# BotClips Android App (.apk) Build & Distribution Guide

Welcome to the official **BotClips Android Application** source repository. This mobile application is engineered to mirror the exact UI/UX design mockups with pixel-to-pixel fidelity, powered by real-time synchronization with the live production backend at `https://botclips.online/api`.

---

## 📱 Implemented Screens & Features

1. **Splash Screen**:
   - Official 3D BotClips blue-purple robot mascot with glowing eyes, antenna, and ambient cosmic backdrop.
   - Tagline: *VIRAL AUTOMATION - Organic Growth & Engagement Engine*.

2. **Auth & One-Tap Login**:
   - Email/password authentication.
   - One-Tap **Google** & **Telegram** login.

3. **Clipper Dashboard**:
   - Live **INR Wallet Balance** (`₹2,480.50`) with instant top-up shortcut.
   - Quick action tiles (*New Order*, *Add Funds*, *Active Queue*, *Whop Payout*).
   - Interactive **Organic Curve Velocity Graph** showing real-time FYP recommendation ramp (850 views/hr).

4. **Multi-Signal Order Studio**:
   - Platform selector cards (*Instagram Reels, TikTok FYP, YouTube Shorts*).
   - **Delivery Strategy Selector**: *Viral S-Curve (Sigmoid)*, *Steady Poisson Drip*, and *Whop Payout Blitz*.
   - **Synchronized 4-Signal Dials**: Views ($100\%$), Likes ($\sim 3.8\%$), Saves ($\sim 1.2\%$), Shares ($\sim 0.8\%$).
   - Live INR Price Calculator and instant order dispatcher.

5. **Active Jitter Queue**:
   - Real-time batch delivery countdown ($02:34$ pacing).
   - Micro-batch status with randomized organic intervals ($2\text{m }12\text{s} - 2\text{m }48\text{s}$).
   - **Milestone Flush Accumulator** tracking sub-signal aggregation.

6. **Instant Add Funds / Deposit Gateway**:
   - High-contrast **Dynamic UPI QR Code** (PhonePe, GPay, Paytm, CRED).
   - Quick deposit amount pills (`₹500`, `₹1000`, `₹2500`, `₹5000`).
   - Multi-chain **Crypto USDT** (TRC-20 & BEP-20) with 1-click address copy and instant balance credit.

7. **Order Inspector**:
   - Live 4-signal delivery counters and micro-batch stage trackers (*Warmup $\rightarrow$ Breakout $\rightarrow$ Delivering $\rightarrow$ Finalizing*).
   - **Audit-Proof Stamp**: Guaranteed 0/100 Bot Index.

8. **Whop Clipper Payouts & Profile**:
   - Revenue analytics graph ($338.4\text{K}$).
   - Verified Clipper badge and milestone progress.
   - Referral system with 1-tap **WhatsApp** and **Telegram** share intents.

---

## ⚡ How to Run Locally & Build Standalone APK

### Option 1: Instant Local Testing via Expo Go
```bash
cd botclips-mobile
npm install
npx expo start
```
*Scan the QR code in the Expo Go app on any Android device to launch instantly.*

### Option 2: Build Standalone APK via EAS Cloud
```bash
cd botclips-mobile
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```
*This command compiles a standalone `.apk` file that can be installed directly on any Android smartphone.*

### Option 3: Local Offline Android Build (Gradle / Android Studio)
```bash
cd botclips-mobile
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```
*The output `.apk` file will be generated at `android/app/build/outputs/apk/release/app-release.apk`.*
