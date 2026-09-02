<div align="center"> 





https://github.com/user-attachments/assets/b206add2-3e76-40f0-b477-397f4cb07656




<!-- placeholder — drop the real hero gif at ./assets/hero.gif --> 

# <font size="10">ZAYX</font>

**ZAYX is a niche-first React Native interaction library starting with fintech.**

[zayx.dev](https://zayx.dev/) <!-- placeholder — swap for the live URL -->

</div> 

## Components

| Component Folder What it does |                                                                          |                                                                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **Card3D**                    | [`expo-card-insight`](https://github.com/ManasCodeXart/expo-card-insight)         | A 3D flip card with a Skia ripple effect on tap, dual-axis drag, and spending insights revealed on the back face.                 |
| **CoinMorphList**             | [`expo-coin-morph`](https://github.com/ManasCodeXart/expo-coin-morph)             | A crypto asset list where tapping a coin morphs the row into a full detail view.                                                  |
| **CoinFlip → ScratchCard**    | [`expo-coin-reward`](https://github.com/ManasCodeXart/expo-coin-reward)           | A gamified reward flow: flip a coin, scratch a card, reveal the prize — with confetti.                                            |
| **CryptoPaySelector**         | [`expo-crypto-orbit`](https://github.com/ManasCodeXart/expo-crypto-orbit)         | Hold-to-reveal a staggered, spring-animated fan of crypto coin bubbles for quick asset selection.                                 |
| **CurrencySwitcher**          | [`expo-currency-switch`](https://github.com/ManasCodeXart/expo-currency-switch)   | An animated send/receive card with swappable currencies, a custom keypad, and live exchange rates via the Frankfurter API.        |
| **QuickActionsDrawer**        | [`expo-finpanel`](https://github.com/ManasCodeXart/expo-finpanel)               | A Samsung Edge Panel-inspired two-panel drawer surfacing quick actions and financial insights.                                    |
| **FintechIsland**             | [`expo-fintech-island`](https://github.com/ManasCodeXart/expo-fintech-island)     | A Dynamic Island-style pill that morphs into an expanded tray, with Lottie animations for sending, adding a card, and saving.     |
| **ReminderCreateSheet**       | [`expo-payment-reminder`](https://github.com/ManasCodeXart/expo-payment-reminder) | A bottom sheet for creating payment reminders — avatar carousel, date/tick pickers, amount keypad, and a draggable reminder pill. |
| **GravitySavings**            | [`expo-piggy-bank`](https://github.com/ManasCodeXart/expo-piggy-bank)             | A piggy bank savings UI with animated falling coins and a rolling digit counter that ticks up on each deposit.                    |
| **QuickPay**                  | [`expo-quick-pay`](https://github.com/ManasCodeXart/expo-quick-pay)               | A send-money bottom sheet with an avatar carousel, snap slider, and animated send status card.                                    |

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

[**ManasCodeXart**](https://github.com/ManasCodeXart) — trying to build something nice.

---

## License

Licensed under the [MIT License](./LICENSE).
