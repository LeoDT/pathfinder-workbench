import { Bonus } from '../types/core';

import { collections } from '../store/collection';

export function aggregateBonuses(bonuses: Bonus[]): Bonus[] {
  const bonusMap = new Map<string, number>();

  for (const b of bonuses) {
    const { stack } = collections.bonusType.getById(b.type);
    const existed = bonusMap.get(b.type) ?? 0;

    if (stack) {
      bonusMap.set(b.type, existed + b.amount);
    } else {
      bonusMap.set(b.type, Math.max(existed, b.amount));
    }
  }

  const result: Bonus[] = [];
  for (const [type, amount] of bonusMap.entries()) {
    result.push({ type, amount });
  }

  return result;
}

export function aggregateBonusesAmount(bonuses: Bonus[]): number {
  return aggregateBonuses(bonuses).reduce((acc, b) => acc + b.amount, 0);
}
