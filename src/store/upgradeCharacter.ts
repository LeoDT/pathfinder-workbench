import { action, computed, makeObservable } from 'mobx';

import { AbilityType } from '../types/core';
import { createContextNoNullCheck } from '../utils/react';
import Character from './character';
import { collections } from './collection';
import CreateCharacterStore, { GainFeatReason } from './createCharacter';

export default class UpgradeCharacterStore extends CreateCharacterStore {
  upgradeAbilityBonus: AbilityType | null;

  constructor(c: Character) {
    super(c);

    makeObservable(this, {
      classOptions: computed,

      gainUpgradeAbilityBonus: computed,
      useUpgradeAbilityBonus: action,
      resetUpgradeAbilityBonus: action,
    });

    this.upgradeAbilityBonus = null;
  }

  get classOptions(): Array<{ text: string; value: string }> {
    return collections.class.data.map((c) => {
      const hasLevel = this.character.levelDetailWithoutPending.get(c) || 0;
      const text = `${c.name} Lv.${hasLevel + 1}`;
      const value = c.id;

      return { text, value };
    });
  }

  get gainUpgradeAbilityBonus(): boolean {
    return this.character.level % 4 === 0;
  }
  useUpgradeAbilityBonus(abt: AbilityType): void {
    this.upgradeAbilityBonus = abt;
    this.upgrade.abilities = {
      [abt]: 1,
    };
  }
  resetUpgradeAbilityBonus(): void {
    this.upgradeAbilityBonus = null;
    this.upgrade.abilities = {};
  }

  get gainFeatReasons(): Array<GainFeatReason> {
    return this.getGainFeatReasons(false);
  }
}

export const [
  useUpgradeCharacterStore,
  UpgradeCharacterStoreContext,
] = createContextNoNullCheck<UpgradeCharacterStore>();
