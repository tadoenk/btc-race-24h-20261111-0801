// btc-race-24h-20261111-0801 entry: a mean-reversion bot for cbBTC/USDC.
// It trades one asset, CBBTC, long only, on 1-minute bars, starting with
// 1,000 USDC of paper money. The dev window (24h, 1,440 bars) fell 1.07%
// with low per-minute volatility, so trend following whipsaws and
// buy-and-hold loses; a dip-buy mean reversion makes money on it.
//
//   - The signal is the close against its 240-bar simple moving average
//     (4 hours): buy with the whole cash when the close is 0.5% or more
//     below the average, sell the whole position when the close is 0.3%
//     or more above it. A round trip pays about 26 bps in fees, slippage
//     and impact, so the 0.8-point swing between the two levels is what
//     the trade is for; the thresholds were picked on the published dev
//     window, where nearby values (entry -0.3% to -0.5%, exit +0.2% to
//     +0.3%) all end positive, and the chosen pair is positive on both
//     halves of the window (+3.23 USDC on the first 12 hours, +11.95 on
//     the second), not one lucky stretch.
//   - No stop-loss: on this window a stop cuts winners and adds losses.
//     The exit is the reversion itself, and the window's end flattens
//     whatever is left, as the harness does.
//   - One position at most, full size, so a buy spends all the cash and
//     a sell empties the position. Each order caps slippage at 100 bps
//     (1%) past the close it was decided on.
//
// Deterministic: no clock, no environment, no randomness; the SMA is a
// running sum, so the same bars give the same orders, run after run.
// Node 22 standard library plus the kit's bars SDK shim, vendored.

import { runBars, type Bar, type BarsState, type BuyInput, type SellInput } from './vendor/makefun-bars.ts';

const SYMBOL = 'CBBTC';
const SMA_BARS = 240;
const ENTRY_BELOW_BPS = 50; // buy when the close is 0.5% under the SMA
const EXIT_ABOVE_BPS = 30; // sell when the close is 0.3% over the SMA
const MAX_SLIPPAGE_BPS = 100;

/** A running simple moving average over the last SMA_BARS closes. */
class Sma {
  readonly span: number;
  #sum = 0;
  #window: number[] = [];
  value: number | null = null;

  constructor(span: number) {
    this.span = span;
  }

  push(close: number): void {
    this.#window.push(close);
    this.#sum += close;
    if (this.#window.length > this.span) {
      this.#sum -= this.#window.shift()!;
    }
    if (this.#window.length === this.span) {
      this.value = this.#sum / this.span;
    }
  }
}

const sma = new Sma(SMA_BARS);

await runBars({
  onBatch(state: BarsState, batch: { bars: Bar[] }) {
    for (const bar of batch.bars) {
      if (bar.symbol !== SYMBOL) continue;
      sma.push(Number(bar.c));
    }
    const avg = sma.value;
    if (avg === null) return [];
    const close = state.close(SYMBOL);
    if (close === null) return [];
    // The deviation of the close from its 240-bar average, in basis points.
    const devBps = (Number(close) - avg) / avg * 10000;
    const held = state.positions.get(SYMBOL);
    const orders: (BuyInput | SellInput)[] = [];
    if (held !== undefined) {
      if (devBps >= EXIT_ABOVE_BPS) {
        orders.push({ side: 'sell', symbol: SYMBOL, qty: held.qty, max_slippage_bps: MAX_SLIPPAGE_BPS });
      }
    } else if (devBps <= -ENTRY_BELOW_BPS) {
      const cash = state.cash;
      if (cash > BigInt(state.hello.fees.min_notional_quote_units)) {
        orders.push({ side: 'buy', symbol: SYMBOL, notional_quote_units: cash, max_slippage_bps: MAX_SLIPPAGE_BPS });
      }
    }
    return orders;
  },
});
