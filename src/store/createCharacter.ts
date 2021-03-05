import { makeObservable, computed } from 'mobx';

import { createContextNoNullCheck } from '../utils/react';
import { ABILITY_POINTS, getTotalScoreCosts } from '../utils/ability';

import { Class, CharacterUpgrade } from './types';

import { collections } from './collection';
import Character from './character';

export default class CreateCharacter {
  character: Character;

  constructor() {
    makeObservable(this, {
      isBasicValid: computed,
      abilityPointsCost: computed,
      abilityPointsRemain: computed,
      class: computed,
      skillPoints: computed,
      skillPointsRemain: computed,
      skillPointsUsed: computed,
    });

    this.character = new Character('新角色');
    this.character.startUpgrade();
  }

  resetBaseAbility(): void {
    this.character.baseAbility = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  }

  get upgrade(): CharacterUpgrade {
    return this.character.pendingUpgrade as CharacterUpgrade;
  }

  get abilityPointsCost(): number {
    return getTotalScoreCosts(this.character.baseAbility);
  }
  get abilityPointsRemain(): number {
    return ABILITY_POINTS - this.abilityPointsCost;
  }
  get isBasicValid(): boolean {
    return this.abilityPointsRemain === 0;
  }

  get class(): Class {
    return collections.class.getById(this.upgrade.classId) as Class;
  }

  get skillPoints(): number {
    return this.class.skillPoints + this.character.abilityModifier.int;
  }
  get skillPointsUsed(): number {
    return Array.from(this.upgrade.skills.values()).reduce((acc, r) => acc + r, 0);
  }
  get skillPointsRemain(): number {
    return this.skillPoints - this.skillPointsUsed;
  }
}

export const [
  useCreateCharacterStore,
  CreateCharacterStoreContext,
] = createContextNoNullCheck<CreateCharacter>();
