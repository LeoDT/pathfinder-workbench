const validDie = ['4', '6', '8', '10', '12', '20'];

export type DiceNotation = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

interface TokenizedDiceDie {
  type: 'dice';
  count: number;
  die: DiceNotation;
  multiplier: 1 | -1;
}

interface TokenizedDiceNumber {
  type: 'number';
  value: number;
  multiplier: 1 | -1;
}

type TokenizedDice = TokenizedDiceDie | TokenizedDiceNumber;

export function parse(s: string): TokenizedDice[] {
  const tokens: string[] = [];

  let current = '';
  let previous = '';
  const commit = () => {
    tokens.push(current);
    previous = current;
    current = '';
  };

  const chars = s.split('').filter((c) => c.trim());

  for (let pos = 0; pos < chars.length; pos++) {
    const ch = chars[pos];
    const peek = chars[pos + 1];

    if (ch === '+' || ch === '-') {
      if (current) {
        commit();
      }

      if (previous !== '+' && previous !== '-' && peek !== undefined) {
        current = ch;

        commit();
      } else {
        throw Error('invalid dice notation');
      }
    } else if (/[\dd]/.test(ch)) {
      current += ch;
    } else {
      throw Error('invalid dice notation');
    }

    if (peek === undefined && current) {
      commit();
    }
  }

  if (current) {
    commit();
  }

  const dices: TokenizedDice[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const p = tokens[i - 1];

    const multiplier = p === '-' ? -1 : 1;

    if (t.includes('d')) {
      const [countStr, dieStr] = t.split('d');

      if (!validDie.includes(dieStr)) throw Error('invalid dice notation');

      const count = countStr === '' ? 1 : parseInt(countStr, 10);
      const die = `d${dieStr}` as DiceNotation;

      dices.push({ type: 'dice', count, die, multiplier });
    }

    if (/^\d+$/.test(t)) {
      dices.push({ type: 'number', value: parseInt(t, 10), multiplier });
    }
  }

  return dices;
}

export function merge(d: TokenizedDice[]): TokenizedDice[] {
  const dies: Record<DiceNotation, number> = {
    d4: 0,
    d6: 0,
    d8: 0,
    d10: 0,
    d12: 0,
    d20: 0,
  };
  let numbers = 0;

  for (const dice of d) {
    if (dice.type === 'dice') {
      dies[dice.die] += dice.count * dice.multiplier;
    } else {
      numbers += dice.value * dice.multiplier;
    }
  }

  const resultDices = Object.entries(dies)
    .filter(([, count]) => count !== 0)
    .map(
      ([die, count]) =>
        ({
          type: 'dice',
          die,
          count: Math.abs(count),
          multiplier: count / Math.abs(count),
        } as TokenizedDiceDie)
    );

  return [
    ...resultDices,
    ...(numbers === 0
      ? []
      : [
          {
            type: 'number',
            value: Math.abs(numbers),
            multiplier: numbers / Math.abs(numbers),
          } as TokenizedDiceNumber,
        ]),
  ];
}

export function stringify(srcDices: TokenizedDice[], mergeFirst = false): string {
  const dices = mergeFirst ? merge(srcDices) : srcDices;

  return dices
    .map((d) => {
      let t = '';

      if (d.type === 'dice' && d.count !== 0) {
        t = `${Math.abs(d.count) === 1 ? '' : d.count}${d.die}`;
      }

      if (d.type === 'number') {
        t = `${d.value}`;
      }

      return [d.multiplier === -1 ? '-' : '+', t];
    })
    .flat()
    .join(' ')
    .replace(/^\+\s/, '');
}
