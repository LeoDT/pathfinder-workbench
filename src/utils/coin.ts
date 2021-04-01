export type CoinUnit = 'cp' | 'sp' | 'gp' | 'pp';

export interface Coin {
  amount: number;
  unit: CoinUnit;
}

const coinStringRegex = /^(?<amount>\d+)\s?(?<unit>[csgp]p)$/i;

export function makeCoin(amount: number, unit: CoinUnit): Coin {
  return {
    amount,
    unit,
  };
}

export function makeCoinFromString(g: string): Coin {
  const { amount, unit } = g.match(coinStringRegex)?.groups || {};

  if (!amount || !unit) {
    throw new Error(`not a valid coin string ${g}`);
  }

  return makeCoin(parseInt(amount), unit as CoinUnit);
}

export function coinMultiply(c: string | Coin, t: number): Coin {
  const coin = typeof c === 'string' ? makeCoinFromString(c) : c;

  return makeCoin(coin.amount * t, coin.unit);
}

export function showCoin(c: Coin): string {
  return `${c.amount} ${c.unit}`;
}
