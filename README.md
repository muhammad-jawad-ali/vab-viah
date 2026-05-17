# Lab Viah (RishtaAI) 💍

Lab Viah (RishtaAI) is a next-generation **Halal Matchmaking** mobile application powered by Agentic AI Twins. 

Unlike traditional platforms, Lab Viah focuses on deep values, family alignment, and absolute privacy. Users create an "AI Twin" of themselves through a guided onboarding process (voice inputs, scenario cards, and moral calibration). This AI Twin then securely negotiates and debates with the AI Twins of potential matches to determine compatibility across 8 critical dimensions (Deen, Family, Career, Finances, Kids, Conflict, Geography, Boundaries) before a human connection is ever made.

### 🌟 Key Features:
- **AI Twin Personality Engine:** An 8-minute, 3-layer onboarding to create your digital matchmaking proxy.
- **Twin-to-Twin Negotiation:** Real-time simulated debates between AI Twins, moderated by an AI orchestrator.
- **Halal Reveal & Wali Dashboard:** Privacy-first matching where the Wali (guardian) is kept in the loop and only highly-compatible matches are unlocked.
- **Service Orchestration:** Integrated video meetings, feedback loops, and a robust safety/dispute system.

---

## 🛠 Technology Stack

This repository contains the **Frontend MVP Prototype**, built for robust cross-platform mobile experiences using:

- **Framework:** [Expo SDK](https://expo.dev/) & React Native
- **Styling:** [NativeWind](https://www.nativewind.dev/) (Tailwind CSS)
- **Navigation:** [React Navigation](https://reactnavigation.org/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Data Management:** [React Query](https://tanstack.com/query/latest)

---

## 🚀 How to Run the App (Feel the Frontend)

Follow these steps to run the Lab Viah mobile frontend on your local machine.

### Prerequisites

- Node.js (v18 or newer recommended)
- npm or yarn
- Expo Go app installed on your physical mobile device (iOS / Android) **OR** an iOS Simulator / Android Emulator setup on your computer.

### Installation & Running

1. **Clone the repository:**
   ```bash
   git clone https://github.com/muhammad-jawad-ali/vab-viah.git
   cd vab-viah
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   *(If you encounter peer dependency warnings, you can safely ignore them or run `npm install --legacy-peer-deps`)*

3. **Start the Expo development server:**
   ```bash
   npx expo start
   ```

4. **Open the App:**
   - **Physical Device:** Open your camera and scan the QR code displayed in the terminal. (Requires the Expo Go app).
   - **iOS Simulator:** Press `i` in the terminal to launch the app on your Mac's iOS Simulator (requires Xcode).
   - **Android Emulator:** Press `a` in the terminal to launch on an Android Emulator (requires Android Studio).

---

## 📂 Project Structure

```text
src/
├── api/             # React Query hooks and providers
├── components/      # Reusable UI elements (SafeScreen, AgTrace, Forms)
├── navigation/      # Stack and Tab navigators (AppNavigator)
├── screens/         # All App screens organized by flow
└── store/           # Global Zustand store (useAppStore)
```

## ⚠️ Developer Notes

- **AG-TRACE:** You will notice an `AG-TRACE` UI banner across agentic screens. This displays simulated logs of the AI agents processing data behind the scenes, highlighting the autonomous nature of the matchmaking.
- **Mocked Data:** Currently, API calls and back-end negotiations are mocked on the client side to demonstrate UI/UX speed and application flow.
- **No "Dating":** Lab Viah strictly adheres to a "Halal Matchmaking" / "Rishta" framework. 
