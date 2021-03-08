import { makeObservable, computed } from 'mobx';

import { createContextNoNullCheck } from '../utils/react';
import { ABILITY_POINTS, getTotalScoreCosts } from '../utils/ability';
import { getClassFeatByLevel } from '../utils/class';
import { getBonusFeatEffect } from '../utils/effect';

import { Class, CharacterUpgrade, ClassFeat, FeatType } from './types';

import { collections } from './collection';
import Character from './character';

export interface GainFeatReason {
  reason: 'race' | 'class' | 'level';
  featType?: FeatType;
  index: number;
}

export default class CreateCharacter {
  character: Character;

  constructor() {
    makeObservable(this, {
      isBasicValid: computed,

      abilityPointsCost: computed,
      abilityPointsRemain: computed,

      class: computed,
      gainFeatReasons: computed,
      newGainedClassFeats: computed,

      skillPoints: computed,
      skillPointsRemain: computed,
      skillPointsUsed: computed,
    });

    this.character = new Character('新角色');
    this.character.startUpgrade();
  }

  resetUpgradeFeats(): void {
    this.upgrade.feats = Array(this.gainFeatReasons.length);
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

  get gainFeatReasons(): Array<GainFeatReason> {
    const reasons: Array<GainFeatReason> = [];
    let index = 0;

    if (this.upgrade.levelFeat) {
      reasons.push({ reason: 'level', index });
      index += 1;
    }

    const racialTrait = this.character.race.racialTrait.find(
      (t) => t.effects && getBonusFeatEffect(t.effects)
    );
    const racialEffect = racialTrait?.effects ? getBonusFeatEffect(racialTrait.effects) : null;
    if (racialEffect) {
      reasons.push({ reason: 'race', index, featType: racialEffect.featType });
      index += 1;
    }

    const classFeat = this.newGainedClassFeats.find(
      (t) => t.effects && getBonusFeatEffect(t.effects)
    );
    const classEffect = classFeat?.effects ? getBonusFeatEffect(classFeat.effects) : null;
    if (classEffect) {
      reasons.push({ reason: 'class', index, featType: classEffect.featType });
      index += 1;
    }

    return reasons;
  }
  get newGainedClassFeats(): ClassFeat[] {
    return getClassFeatByLevel(this.class, this.character.levelDetail[this.class.id] || 1);
  }

  updateClass(cId: string): void {
    this.upgrade.classId = cId;

    this.resetUpgradeFeats();
  }
  get class(): Class {
    return collections.class.getById(this.upgrade.classId);
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
