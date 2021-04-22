import { compact } from 'lodash-es';
import { makeObservable, computed, action, reaction } from 'mobx';

import { createContextNoNullCheck } from '../utils/react';
import {
  ABILITY_POINTS,
  addBonusScores,
  BASE_ABILITY,
  getTotalScoreCosts,
  makeAbilities,
} from '../utils/ability';
import { gainClassSpecialityEffectType, getClassFeatByLevel } from '../utils/class';

import { Class, ClassFeat } from '../types/core';
import { EffectGainClassSpeciality, EffectGainFeatArgs } from '../types/effectType';
import { CharacterUpgrade } from '../types/characterUpgrade';

import { collections } from './collection';
import Character from './character';
import Spellbook from './spellbook';
import { constraintAppliedAlignmentOptions } from '../utils/alignment';

export interface GainFeatReason extends EffectGainFeatArgs {
  reason: 'race' | 'class' | 'level';
  index: number;
}

export type InvalidReason =
  | 'abilityBonus'
  | 'classSpeciality'
  | 'abilityPoints'
  | 'skillPoints'
  | 'feat'
  | 'spell'
  | 'favoredClass';

export default class CreateCharacterStore {
  character: Character;

  constructor(character?: Character) {
    makeObservable(this, {
      resetUpgradeFeats: action,
      resetAbility: action,

      abilityPointsCost: computed,
      abilityPointsRemain: computed,

      class: computed,
      updateClass: action,
      gainFeatReasons: computed,
      newGainedClassFeats: computed,
      newGainedClassSpeciality: computed,

      setEffectInput: action,
      deleteEffectInput: action,

      skillPoints: computed,
      skillPointsRemain: computed,
      skillPointsUsed: computed,

      spellbook: computed,
    });

    this.character = character || new Character('新角色');
    this.character.startUpgrade();
    this.updateClass(this.upgrade.classId);
    this.character.ensureSpellbooks();

    this.resetUpgradeFeats();

    reaction(
      () => this.character.skillSystem,
      () => {
        this.upgrade.skills.clear();
      }
    );

    reaction(
      () => ({
        cId: this.upgrade.classId,
        rId: this.character.raceId,
        traits: this.character.alternateRaceTraitIds,
      }),
      () => {
        this.upgrade.effectInputs.clear();
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).create = this;
  }

  resetUpgradeFeats(): void {
    this.upgrade.feats = Array(this.gainFeatReasons.length);

    this.gainFeatReasons.forEach((r, i) => {
      if (r.forceFeat) {
        this.upgrade.feats[i] = r.forceFeat;
      }
    });
  }
  resetAbility(): void {
    this.upgrade.abilities = makeAbilities(0);
  }

  get upgrade(): CharacterUpgrade {
    return this.character.pendingUpgrade as CharacterUpgrade;
  }

  get abilityPointsCost(): number {
    const firstUpgrade =
      this.character.upgrades.length >= 1
        ? this.character.upgrades[0]
        : this.character.pendingUpgrade;

    if (!firstUpgrade) return 0;

    return getTotalScoreCosts(addBonusScores(makeAbilities(BASE_ABILITY), firstUpgrade.abilities));
  }
  get abilityPointsRemain(): number {
    return ABILITY_POINTS - this.abilityPointsCost;
  }

  getGainFeatReasons(includeRacial: boolean): Array<GainFeatReason> {
    const reasons: Array<GainFeatReason> = [];
    let index = 0;

    if (this.upgrade.levelFeat) {
      reasons.push({ reason: 'level', index });
      index += 1;
    }

    // when leveling up, only class feat bring new feats
    const newGainedEffects =
      this.character.level > 1
        ? this.character.effect.getEffectsFromClassFeats(this.newGainedClassFeats)
        : undefined;
    const effects = this.character.effect.getGainFeatEffects(newGainedEffects);

    effects.forEach(({ effect, source }) => {
      switch (source._type) {
        case 'classFeat':
          if (this.newGainedClassFeats.includes(source)) {
            reasons.push({ reason: 'class', index, ...effect.args });
            index += 1;
          }
          break;
        case 'racialTrait':
          if (includeRacial) {
            reasons.push({ reason: 'race', index, ...effect.args });
            index += 1;
          }
          break;
        default:
          break;
      }
    });

    return reasons;
  }
  get gainFeatReasons(): Array<GainFeatReason> {
    return this.getGainFeatReasons(true);
  }
  get newGainedClassFeats(): ClassFeat[] {
    return getClassFeatByLevel(this.class, this.character.levelDetail.get(this.class) || 1);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEffectInput(type: 'feat' | 'classFeat' | 'racialTrait', id: string, suffix?: string): any {
    return this.upgrade.effectInputs.get(`${type}:${id}${suffix ? `:${suffix}` : ''}`);
  }
  setEffectInput(
    type: 'feat' | 'classFeat' | 'racialTrait',
    id: string,
    value: unknown,
    suffix?: string
  ): void {
    this.upgrade.effectInputs.set(`${type}:${id}${suffix ? `:${suffix}` : ''}`, value);
  }
  deleteEffectInput(type: 'feat' | 'classFeat' | 'racialTrait', id: string, suffix?: string): void {
    this.upgrade.effectInputs.delete(`${type}:${id}${suffix ? `:${suffix}` : ''}`);
  }

  updateClass(cId: string): void {
    this.upgrade.classId = cId;

    if (this.character.level === 1) {
      this.character.favoredClassIds = [cId];
    } else {
      this.upgrade.hp = this.class.hd / 2 + 1;
    }

    const alignmentOptions = constraintAppliedAlignmentOptions(this.class.alignment);
    if (alignmentOptions.find((o) => o.value === this.character.alignment)?.disabled === true) {
      const a = alignmentOptions.find((o) => !o.disabled)?.value;

      if (a) {
        this.character.alignment = a;
      } else {
        throw new Error(`can not decide alignment for class ${this.class.id}`);
      }
    }

    this.resetUpgradeFeats();
    this.upgrade.classSpeciality = null;
    this.character.ensureSpellbooks();
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
    const classSkillPoints =
      this.class.skillPoints / Math.floor(this.character.skillSystem === 'core' ? 1 : 2);

    const favoredClassBonus = this.upgrade.favoredClassBonus === 'skill' ? 1 : 0;

    return classSkillPoints + favoredClassBonus + this.character.abilityModifier.int;
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
        'abilityBonus',
        this.character.maxBonusAbilityType > 0
          ? this.character.bonusAbilityType.length !== this.character.maxBonusAbilityType
          : false,
      ],
      [
        'classSpeciality',
        this.newGainedClassSpeciality.length > 0 && !this.upgrade.classSpeciality,
      ],
      ['skillPoints', this.skillPointsRemain !== 0],
      ['feat', this.gainFeatReasons.length !== compact(this.upgrade.feats).length],
      ['spell', !this.spellbookValid],
      ['favoredClass', this.character.favoredClassIds.length !== this.character.maxFavoredClass],
    ];

    return validates.filter(([, v]) => v).map(([r]) => r);
  }
}

export const [
  useCreateCharacterStore,
  CreateCharacterStoreContext,
] = createContextNoNullCheck<CreateCharacterStore>();
