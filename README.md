<div align="center"> 

[ZAYX Hero](https://claude.ai/chat/assets/hero.gif)

<!-- placeholder — drop the real hero gif at ./assets/hero.gif --> 

# ZAYX

**ZAYX is a niche-first React Native interaction library starting with fintech.**

[zayx.dev](https://zayx.dev/) <!-- placeholder — swap for the live URL -->

</div> 

---

## Components

| Component Folder What it does |                                                                          |                                                                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **Card3D**                    | [`card-insight`](https://claude.ai/chat/components/card-insight)         | A 3D flip card with a Skia ripple effect on tap, dual-axis drag, and spending insights revealed on the back face.                 |
| **CoinMorphList**             | [`coin-morph`](https://claude.ai/chat/components/coin-morph)             | A crypto asset list where tapping a coin morphs the row into a full detail view.                                                  |
| **CoinFlip → ScratchCard**    | [`coin-reward`](https://claude.ai/chat/components/coin-reward)           | A gamified reward flow: flip a coin, scratch a card, reveal the prize — with confetti.                                            |
| **CryptoPaySelector**         | [`crypto-orbit`](https://claude.ai/chat/components/crypto-orbit)         | Hold-to-reveal a staggered, spring-animated fan of crypto coin bubbles for quick asset selection.                                 |
| **CurrencySwitcher**          | [`currency-switch`](https://claude.ai/chat/components/currency-switch)   | An animated send/receive card with swappable currencies, a custom keypad, and live exchange rates via the Frankfurter API.        |
| **QuickActionsDrawer**        | [`fin-panel`](https://claude.ai/chat/components/fin-panel)               | A Samsung Edge Panel-inspired two-panel drawer surfacing quick actions and financial insights.                                    |
| **FintechIsland**             | [`fintech-island`](https://claude.ai/chat/components/fintech-island)     | A Dynamic Island-style pill that morphs into an expanded tray, with Lottie animations for sending, adding a card, and saving.     |
| **ReminderCreateSheet**       | [`payment-reminder`](https://claude.ai/chat/components/payment-reminder) | A bottom sheet for creating payment reminders — avatar carousel, date/tick pickers, amount keypad, and a draggable reminder pill. |
| **GravitySavings**            | [`piggy-bank`](https://claude.ai/chat/components/piggy-bank)             | A piggy bank savings UI with animated falling coins and a rolling digit counter that ticks up on each deposit.                    |
| **QuickPay**                  | [`quick-pay`](https://claude.ai/chat/components/quick-pay)               | A send-money bottom sheet with an avatar carousel, snap slider, and animated send status card.                                    |

---

## Guide

**Pull a component straight into your project:**

```bash
npx degit ManasCodeXart/ZAYX/components/[component-name] components/[component-name]
```

Then install the peer deps listed on that component's page and import it:

```ts
import { ComponentName } from './components/[component-name]/ComponentName'
```

No package, no version to manage — the component is a plain file in your project the moment `degit` finishes. The full step-by-step walkthrough lives on the [ZAYX site](https://zayx.dev/) <!-- placeholder -->.

---

## Built by

[**ManasCodeXart**](https://github.com/ManasCodeXart) — designer, developer, mobile design engineer.

---

## License

Licensed under the [MIT License](./LICENSE).
