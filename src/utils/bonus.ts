import { groupBy } from 'lodash-es';

import { NamedBonus } from '../types/core';

import { collections } from '../store/collection';

export function markUnstackableBonus(bonuses: NamedBonus[]): NamedBonus[] {
  const result: NamedBonus[] = [];
  const groups = groupBy(bonuses, (b) => b.bonus.type);

  Object.keys(groups).forEach((k) => {
    const bonusesForType = groups[k];
    const { stack } = collections.bonusType.getById(k);

    if (stack) {
      for (const b of bonusesForType) {
        result.push({ ...b, bonus: { ...b.bonus, ignored: false } });
      }
    } else {
      let max = bonusesForType[0];
      for (const b of bonusesForType) {
        const currentAmount = Array.isArray(b.bonus.amount)
          ? Math.max(...b.bonus.amount)
          : b.bonus.amount;
        const maxAmount = Array.isArray(max.bonus.amount)
          ? Math.max(...max.bonus.amount)
          : max.bonus.amount;

        if (currentAmount > maxAmount) {
          max = b;
        }
      }

      for (const b of bonusesForType) {
        result.push({ ...b, bonus: { ...b.bonus, ignored: b !== max } });
      }
    }
  });

  return result;
}
