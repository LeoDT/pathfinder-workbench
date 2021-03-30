import { computed, action, makeObservable } from 'mobx';

import { Abilities, AbilityType } from '../types/core';
import { createContextNoNullCheck } from '../utils/react';

import { collections } from './collection';
import Character from './character';
import CreateCharacterStore, { GainFeatReason } from './createCharacter';

export default class UpgradeCharacterStore extends CreateCharacterStore {
  baseAbilityBefore: Abilities;
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
    this.baseAbilityBefore = { ...this.character.baseAbility };
  }

  resetBaseAbility(): void {
    this.character.baseAbility = { ...this.baseAbilityBefore };
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
  }
  resetUpgradeAbilityBonus(): void {
    this.upgradeAbilityBonus = null;
  }

  get gainFeatReasons(): Array<GainFeatReason> {
    return this.getGainFeatReasons(false);
  }
}

export const [
  useUpgradeCharacterStore,
  UpgradeCharacterStoreContext,
] = createContextNoNullCheck<UpgradeCharacterStore>();
