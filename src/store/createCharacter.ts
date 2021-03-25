import { compact } from 'lodash-es';
import { makeObservable, computed } from 'mobx';

import { createContextNoNullCheck } from '../utils/react';
import { ABILITY_POINTS, getTotalScoreCosts } from '../utils/ability';
import { gainClassSpecialityEffectType, getClassFeatByLevel } from '../utils/class';
import { getBonusFeatEffect } from '../utils/effect';

import { Class, ClassFeat, FeatType } from '../types/core';
import { EffectGainClassSpeciality } from '../types/effectType';
import { CharacterUpgrade } from '../types/characterUpgrade';

import { collections } from './collection';
import Character from './character';
import Spellbook from './spellbook';

export interface GainFeatReason {
  reason: 'race' | 'class' | 'level';
  featType?: FeatType;
  index: number;
}

export type InvalidReason = 'classSpeciality' | 'abilityPoints' | 'skillPoints' | 'feat' | 'spell';

export default class CreateCharacter {
  character: Character;

  constructor() {
    makeObservable(this, {
      abilityPointsCost: computed,
      abilityPointsRemain: computed,

      class: computed,
      gainFeatReasons: computed,
      newGainedClassFeats: computed,
      newGainedClassSpeciality: computed,

      skillPoints: computed,
      skillPointsRemain: computed,
      skillPointsUsed: computed,

      spellbook: computed,
    });

    this.character = new Character('新角色');
    this.character.startUpgrade();
    this.character.initSpellbook();

    this.spellbook?.initKnownSpells();
    this.resetUpgradeFeats();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).create = this;
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

  get newGainedClassSpeciality(): Array<EffectGainClassSpeciality> {
    // TODO: there should be only one speciality
    return compact(
      this.newGainedClassFeats
        .map((cf) =>
          cf.effects?.filter((e): e is EffectGainClassSpeciality =>
            gainClassSpecialityEffectType.includes(e.type)
          )
        )
        .flat()
    );
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

  get spellbook(): Spellbook | undefined {
    return this.character.spellbooks.find((sb) => sb.class.id === this.upgrade.classId);
  }

  get spellbookValid(): boolean {
    if (!this.spellbook) return true;

    switch (this.spellbook.castingType) {
      case 'wizard-like':
        return this.upgrade.spells.length === this.spellbook.wizardNewSpellSlots;

      default:
        return false;
    }
  }

  validate(): InvalidReason[] {
    const validates: Array<[InvalidReason, boolean]> = [
      ['abilityPoints', this.abilityPointsRemain !== 0],
      [
        'classSpeciality',
        this.newGainedClassSpeciality.length > 0 && !this.upgrade.classSpeciality,
      ],
      ['skillPoints', this.skillPointsRemain !== 0],
      ['feat', this.gainFeatReasons.length !== this.upgrade.feats.length],
      ['spell', !this.spellbookValid],
    ];

    return validates.filter(([, v]) => v).map(([r]) => r);
  }
}

export const [
  useCreateCharacterStore,
  CreateCharacterStoreContext,
] = createContextNoNullCheck<CreateCharacter>();
