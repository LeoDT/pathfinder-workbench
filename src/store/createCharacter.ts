import { compact, range } from 'lodash-es';
import { action, computed, makeObservable, reaction } from 'mobx';

import { CharacterUpgrade } from '../types/characterUpgrade';
import { Class, ClassFeat } from '../types/core';
import { EffectGainFeatArgs } from '../types/effectType';
import {
  ABILITY_POINTS,
  BASE_ABILITY,
  addBonusScores,
  getTotalScoreCosts,
  makeAbilities,
} from '../utils/ability';
import { constraintAppliedAlignmentOptions } from '../utils/alignment';
import { createContextNoNullCheck } from '../utils/react';
import { partitionSpellsByLevel } from '../utils/spell';
import Character from './character';
import { EntityTypesValidForEffectSource } from './character/effect';
import { CharacterSpellbook } from './character/spellbook';
import { collections } from './collection';

export interface GainFeatReason extends EffectGainFeatArgs {
  reason: 'race' | 'class' | 'level';
  index: number;
}

export type InvalidReason =
  | 'abilityBonus'
  | 'abilityPoints'
  | 'skillPoints'
  | 'feat'
  | 'spell'
  | 'favoredClass';

export default class CreateCharacterStore {
  character: Character;
  disposes: Array<() => void>;

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

      setEffectInput: action,
      deleteEffectInput: action,

      skillPoints: computed,
      skillPointsRemain: computed,
      skillPointsUsed: computed,

      spellbook: computed,
    });

    this.disposes = [];

    this.character = character || new Character('新角色');
    this.character.startUpgrade();
    this.updateClass(this.upgrade.classId, this.upgrade.archetypeIds);
    this.character.ensureSpellbooks();

    this.resetUpgradeFeats();

    this.disposes.push(
      reaction(
        () => this.character.skillSystem,
        () => {
          this.upgrade.skills.clear();
        }
      )
    );

    this.disposes.push(
      reaction(
        () => ({
          cId: this.upgrade.classId,
          aIds: this.upgrade.archetypeIds,
          rId: this.character.raceId,
          traits: this.character.alternateRaceTraitIds,
        }),
        () => {
          this.upgrade.effectInputs.clear();
        }
      )
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).create = this;
  }

  dispose(): void {
    this.disposes.forEach((d) => d());
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
    return collections.class.getClassFeatsByLevel(
      this.class,
      this.character.levelDetail.get(this.class) || 1,
      this.character.getArchetypesForClass(this.class)
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEffectInput(type: EntityTypesValidForEffectSource, id: string, suffix?: string): any {
    return this.upgrade.effectInputs.get(`${type}:${id}${suffix ? `:${suffix}` : ''}`);
  }
  setEffectInput(
    type: EntityTypesValidForEffectSource,
    id: string,
    value: unknown,
    suffix?: string
  ): void {
    this.upgrade.effectInputs.set(`${type}:${id}${suffix ? `:${suffix}` : ''}`, value);
  }
  deleteEffectInput(type: EntityTypesValidForEffectSource, id: string, suffix?: string): void {
    this.upgrade.effectInputs.delete(`${type}:${id}${suffix ? `:${suffix}` : ''}`);
  }

  updateClass(cId: string, aId: string[] | null): void {
    this.upgrade.classId = cId;
    this.upgrade.archetypeIds = aId?.length === 0 || !aId ? null : aId;

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
    this.character.ensureSpellbooks();
  }
  get class(): Class {
    return collections.class.getById(this.upgrade.classId);
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

  get spellbook(): CharacterSpellbook | undefined {
    return this.character.spellbooks.find((sb) => sb.class.id === this.upgrade.classId);
  }

  get spellbookValid(): boolean {
    if (!this.spellbook) return true;

    switch (this.spellbook.castingType) {
      case 'wizard-like':
        return this.upgrade.spells.length === this.spellbook.wizardNewSpellSlots;
      case 'sorcerer-like': {
        const spells = partitionSpellsByLevel(
          collections.spell.getByIds(this.upgrade.spells),
          this.class
        );
        const slotsForLevel = range(0, 10).map((l) =>
          this.spellbook?.getSorcererNewSpellSlotsForLevel(l)
        );

        return slotsForLevel.every((slots, level) => {
          if (slots === 0) return true;

          return spells[level]?.length === slots;
        });
      }

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
