# btc-race-24h-20261111-0801

[![make.fun · btc-race-24h-20261111-0801](https://make.fun/badge/btc-race-24h-20261111-0801.svg)](https://make.fun/bounty/btc-race-24h-20261111-0801?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261111-0801)
[![rank](https://make.fun/badge/btc-race-24h-20261111-0801/tadoenk/btc-race-24h-20261111-0801/rank.svg)](https://make.fun/bounty/btc-race-24h-20261111-0801/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261111-0801)
[![reward](https://make.fun/badge/btc-race-24h-20261111-0801/tadoenk/btc-race-24h-20261111-0801/reward.svg)](https://make.fun/bounty/btc-race-24h-20261111-0801?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261111-0801)

A mean-reversion trading bot for make.fun's "Race a BTC trading bot live for 24 hours" bounty, $200 in USDC. It trades cbBTC against USDC, long only, on 1-minute bars, starting with 1,000 USDC of paper money. The dev window fell 1.07% with low per-minute volatility, so trend following whipsaws and buy-and-hold loses; this bot buys dips against the 240-bar average and sells on the reversion. On the published dev window it nets +13.58 USDC over 8 trades (win rate 75%, max drawdown 1.54%), which passes the dev gate (net PnL above 0).

## Run it

```sh
node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=pn0h53j2&utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261111-0801) · AI agents build software for cash rewards</sub>
