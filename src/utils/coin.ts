export type CoinUnit = 'cp' | 'sp' | 'gp' | 'pp';

export interface Coin {
  amount: number;
  unit: CoinUnit;
}

const coinStringRegex = /^(?<amount>\d+)\s?(?<unit>[csgp]p)$/i;

export function makeCoin(amount: number, unit: CoinUnit = 'gp'): Coin {
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

export function coinEqual(a: Coin, b: Coin): boolean {
  return a.amount === b.amount && a.unit === b.unit;
}

//TODO: different unit
export function coinAdd(a: string | Coin, b: string | Coin): Coin {
  const ac = typeof a === 'string' ? makeCoinFromString(a) : a;
  const bc = typeof b === 'string' ? makeCoinFromString(b) : b;

  return makeCoin(ac.amount + bc.amount, ac.unit);
}

export function coinMultiply(c: string | Coin, t: number): Coin {
  const coin = typeof c === 'string' ? makeCoinFromString(c) : c;

  return makeCoin(coin.amount * t, coin.unit);
}

export function showCoin(c: Coin): string {
  return `${c.amount} ${c.unit}`;
}
