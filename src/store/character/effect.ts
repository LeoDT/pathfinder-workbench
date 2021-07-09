import { computed, makeObservable } from 'mobx';

import { Class, ClassFeat, Feat, MagicItemType, RacialTrait } from '../../types/core';
import * as Effects from '../../types/effectType';
import {
  makeEffectInputKey,
  makeManualEffectSource,
  validateGainArcaneSchoolEffectInput,
  validateGainBloodlineEffectInput,
  validateGainDomainEffectInput,
} from '../../utils/effect';
import { collections } from '../collection';
import { Character } from '.';

export type EntityTypesValidForEffectSource =
  | 'racialTrait'
  | 'classFeat'
  | 'feat'
  | 'magicItemType';
export type EffectSource = RacialTrait | ClassFeat | Feat | MagicItemType;

export interface EffectAndSource<T = Effects.Effect> {
  effect: T;
  source: EffectSource;
  input?: unknown;
  extendedFrom?: EffectAndSource;
}

export class CharacterEffect {
  character: Character;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  growedEffectCache: WeakMap<any, Effects.Effect>;

  constructor(character: Character) {
    makeObservable(this, {
      gainedFeatsWithEffectInputs: computed,
      allEffects: computed,
      effectsNeedInput: computed,
    });

    this.character = character;
    this.growedEffectCache = new WeakMap();
  }

  clearGrowedEffectCache(): void {
    this.growedEffectCache = new WeakMap();
  }

  get gainedFeatsWithEffectInputs(): Array<{ feat: Feat; input: unknown }> {
    return this.character.upgradesWithPending
      .map((up) => {
        return up.feats
          .map((f, i) => {
            if (!f) return null;

            const feat = collections.feat.getById(f);
            const inputKey = makeEffectInputKey(feat, i.toString());
            const input = up.effectInputs.get(inputKey);

            return { feat, input };
          })
          .filter((r): r is { feat: Feat; input: unknown } => Boolean(r));
      })
      .flat();
  }

  getEffectInputForRacialTrait(t: RacialTrait): unknown {
    const upgrade = this.character.upgradesWithPending[0];

    return upgrade?.effectInputs.get(makeEffectInputKey(t));
  }

  getEffectInputForClassFeat(clas: Class, f: ClassFeat): unknown {
    const upgrade = this.character.upgradesWithPending
      .filter((u) => u.classId === clas.id)
      .find((u, i) => {
        const classFeatsForLevel = collections.class.getClassFeatsByLevel(
          clas,
          i + 1,
          this.character.getArchetypesForClass(clas)
        );

        return classFeatsForLevel.includes(f);
      });

    return upgrade?.effectInputs.get(makeEffectInputKey(f));
  }

  extendEffect(es: EffectAndSource): EffectAndSource | EffectAndSource[] {
    const { effect, input } = es;
    switch (effect.type) {
      case Effects.EffectType.gainArcaneSchool: {
        if (!input) return es;

        const realInput = validateGainArcaneSchoolEffectInput(input);
        const powers = collections.arcaneSchool.getArcaneSchoolPowers(
          realInput.school,
          realInput.focused
        );
        const newES = powers
          .map(
            (p) =>
              p.effects
                ?.map((effect): EffectAndSource => ({ effect, source: p, extendedFrom: es }))
                .flat() ?? []
          )
          .flat();

        return [es, ...newES];
      }

      case Effects.EffectType.gainBloodline: {
        if (!input) return es;

        const realInput = validateGainBloodlineEffectInput(input);
        const bloodline = collections.sorcererBloodline.getById(realInput.bloodline);
        const newES = bloodline.powers
          .map(
            (p) =>
              p.effects
                ?.map((effect): EffectAndSource => ({ effect, source: p, extendedFrom: es }))
                .flat() ?? []
          )
          .flat();

        return [es, ...newES];
      }

      case Effects.EffectType.gainDomain: {
        if (!input) return es;

        const realInput = validateGainDomainEffectInput(input);
        const domains = collections.domain.getByIds(realInput.domains);
        const newES = domains
          .map((domain) =>
            domain.powers
              .map(
                (p) =>
                  p.effects
                    ?.map((effect): EffectAndSource => ({ effect, source: p, extendedFrom: es }))
                    .flat() ?? []
              )
              .flat()
          )
          .flat();
        return [es, ...newES];
      }

      default:
        return es;
    }
  }

  get allEffects(): Array<EffectAndSource> {
    const effects: Array<EffectAndSource> = [];
    const add = (effectAndSources: EffectAndSource | EffectAndSource[]) => {
      [effectAndSources].flat().forEach((es) => {
        if ((es.effect.when || es.source.effectsWhen) && this.character.formulaParserReady) {
          let result = false;

          if (es.effect.when) {
            result = this.character.parseFormulaBoolean(es.effect.when);
          } else if (es.source.effectsWhen) {
            result = this.character.parseFormulaBoolean(es.source.effectsWhen);
          }

          if (result) {
            effects.push(es);
          }

          if (typeof result !== 'boolean') {
            console.warn(
              `got a non boolean value for effect's when, effect ${es.effect.type} from ${es.source.name}`
            );
          }
        } else {
          effects.push(es);
        }
      });
    };

    this.character.racialTraits.forEach((source) => {
      source.effects?.forEach((effect) => {
        add(
          this.extendEffect({
            effect: this.growEffectArgs(effect, source),
            source,
            input: this.getEffectInputForRacialTrait(source),
          })
        );
      });
    });

    this.character.gainedClassFeats.forEach((feats, clas) => {
      feats.forEach((source) => {
        source.effects?.forEach((effect) => {
          add(
            this.extendEffect({
              effect: this.growEffectArgs(effect, source),
              source,
              input: this.getEffectInputForClassFeat(clas, source),
            })
          );
        });
      });
    });

    this.gainedFeatsWithEffectInputs.forEach(({ feat: source, input }) => {
      source.effects?.forEach((effect) => {
        add(this.extendEffect({ effect: this.growEffectArgs(effect, source), source, input }));
      });
    });

    this.character.manualEffects.forEach(({ name, effects, inputs }) => {
      const source = makeManualEffectSource(name);

      effects.forEach((effect, i) => {
        add({ effect, source, input: inputs?.[i] ?? undefined });
      });
    });

    // read equip so that equip changing can trigger effects recalculation
    const { equipment } = this.character;
    [equipment.mainHand, equipment.offHand, equipment.buckler, equipment.armor].reverse();
    equipment.wondrous.forEach((w) => {
      w.type.effects?.forEach((effect) => {
        add(this.extendEffect({ effect, source: w.type }));
      });
    });

    return effects;
  }

  get effectsNeedInput(): EffectAndSource<Effects.EffectNeedInput>[] {
    return Effects.effectTypesNeedInput
      .map((t) => this.getEffectsByType<Effects.EffectNeedInput>(t))
      .flat();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getEffectsByType<T extends Effects.BaseEffect<any, any>>(
    t: Effects.EffectType,
    fromEffects?: Array<EffectAndSource>
  ): EffectAndSource<T>[] {
    return (fromEffects ?? this.allEffects).filter(
      (es): es is EffectAndSource<T> => es.effect.type === t
    );
  }

  private makeGrowedEffect<T extends Effects.Effect>(
    e: T,
    g: { level: number; args: Effects.ArgsTypeForEffect<T> }
  ): T {
    const hit = this.growedEffectCache.get(g);

    if (hit) return hit as T;

    const growed: T = {
      ...e,
      args: {
        ...e.args,
        ...g.args,
      },
      origin: e,
    };
    this.growedEffectCache.set(g, growed);

    return growed;
  }

  private growEffectArgs<T extends Effects.Effect>(e: T, source: EffectSource): T {
    if (!e.growArgs) return e;

    let level = 0;
    switch (source._type) {
      case 'classFeat': {
        let clas = null;
        for (const [c, feats] of this.character.gainedClassFeats.entries()) {
          if (feats.includes(source)) {
            clas = c;
          }
        }

        if (clas) {
          level = this.character.getLevelForClass(clas);
        }
        break;
      }
      default:
        level = this.character.level;
        break;
    }

    if (level > 0) {
      for (let i = e.growArgs.length - 1; i >= 0; i--) {
        const g = e.growArgs[i];

        if (g.level <= level) {
          return this.makeGrowedEffect(e, g);
        }
      }
    }

    return e;
  }

  getRootEffectSource(es: EffectAndSource): EffectSource {
    if (es.extendedFrom) {
      return this.getRootEffectSource(es.extendedFrom);
    }

    return es.source;
  }

  getEffectsFromClassFeats(feats: ClassFeat[]): Array<EffectAndSource> {
    const effects: Array<EffectAndSource> = [];

    feats.forEach((source) => {
      source.effects?.forEach((effect) => {
        effects.push({ effect: this.growEffectArgs(effect, source), source });
      });
    });

    return effects;
  }

  getGainFeatEffects(fromEffects?: EffectAndSource[]): EffectAndSource<Effects.EffectGainFeat>[] {
    return this.getEffectsByType<Effects.EffectGainFeat>(Effects.EffectType.gainFeat, fromEffects);
  }

  getGainArcaneSchoolEffects(): EffectAndSource<Effects.EffectGainArcaneSchool>[] {
    return this.getEffectsByType<Effects.EffectGainArcaneSchool>(
      Effects.EffectType.gainArcaneSchool
    );
  }

  getRacialAbilityBonusEffects(): EffectAndSource<Effects.EffectRacialAbilityBonus>[] {
    return this.getEffectsByType<Effects.EffectRacialAbilityBonus>(
      Effects.EffectType.racialAbilityBonus
    );
  }

  getAbilityBonusEffects(): EffectAndSource<Effects.EffectAbilityBonus>[] {
    return this.getEffectsByType<Effects.EffectAbilityBonus>(Effects.EffectType.abilityBonus);
  }

  getGainSpellCastingEffects(): EffectAndSource<Effects.EffectGainSpellCasting>[] {
    return this.getEffectsByType<Effects.EffectGainSpellCasting>(
      Effects.EffectType.gainSpellCasting
    );
  }

  getGainFavoredClassAmountEffects(): EffectAndSource<Effects.EffectGainFavoredClassAmount>[] {
    return this.getEffectsByType<Effects.EffectGainFavoredClassAmount>(
      Effects.EffectType.gainFavoredClassAmount
    );
  }

  getGainProficiencyEffects(): EffectAndSource<Effects.EffectGainProficiency>[] {
    return this.getEffectsByType<Effects.EffectGainProficiency>(Effects.EffectType.gainProficiency);
  }

  getGainSelectedWeaponProficiencyEffects(): EffectAndSource<Effects.EffectGainSelectedWeaponProficiency>[] {
    return this.getEffectsByType<Effects.EffectGainSelectedWeaponProficiency>(
      Effects.EffectType.gainSelectedWeaponProficiency
    );
  }

  getGainSkillEffects(): EffectAndSource<Effects.EffectGainSkill>[] {
    return this.getEffectsByType<Effects.EffectGainSkill>(Effects.EffectType.gainSkill);
  }

  getGainClassSkillEffects(): EffectAndSource<Effects.EffectGainClassSkill>[] {
    return this.getEffectsByType<Effects.EffectGainClassSkill>(Effects.EffectType.gainClassSkill);
  }

  getGainInitiativeEffects(): EffectAndSource<Effects.EffectGainInitiative>[] {
    return this.getEffectsByType<Effects.EffectGainInitiative>(Effects.EffectType.gainInitiative);
  }

  getGainACEffects(): EffectAndSource<Effects.EffectGainAC>[] {
    return this.getEffectsByType<Effects.EffectGainAC>(Effects.EffectType.gainAC);
  }
  getGainCMDEffects(): EffectAndSource<Effects.EffectGainCMD>[] {
    return this.getEffectsByType<Effects.EffectGainCMD>(Effects.EffectType.gainCMD);
  }

  getGainHPEffects(): EffectAndSource<Effects.EffectGainHP>[] {
    return this.getEffectsByType<Effects.EffectGainHP>(Effects.EffectType.gainHP);
  }

  getGainSaveEffects(): EffectAndSource<Effects.EffectGainSave>[] {
    return this.getEffectsByType<Effects.EffectGainSave>(Effects.EffectType.gainSave);
  }

  getGainTwoWeaponFightingEffects(): EffectAndSource<Effects.EffectGainTwoWeaponFighting>[] {
    return this.getEffectsByType<Effects.EffectGainTwoWeaponFighting>(
      Effects.EffectType.gainTwoWeaponFighting
    );
  }

  getGainSpeedEffects(): EffectAndSource<Effects.EffectGainSpeed>[] {
    return this.getEffectsByType<Effects.EffectGainSpeed>(Effects.EffectType.gainSpeed);
  }

  getClassFeatSourceEffects(): EffectAndSource<Effects.EffectClassFeatSource>[] {
    return this.getEffectsByType<Effects.EffectClassFeatSource>(Effects.EffectType.classFeatSource);
  }
  getClassFeatPlaceholderEffects(): EffectAndSource<Effects.EffectClassFeatPlaceholder>[] {
    return this.getEffectsByType<Effects.EffectClassFeatPlaceholder>(
      Effects.EffectType.classFeatPlaceholder
    );
  }

  getEnchantUnarmedStrikeEffects(): EffectAndSource<Effects.EffectEnchantUnarmedStrike>[] {
    return this.getEffectsByType<Effects.EffectEnchantUnarmedStrike>(
      Effects.EffectType.enchantUnarmedStrike
    );
  }

  getAddAttackOptionEffects(): EffectAndSource<Effects.EffectAddAttackOption>[] {
    return this.getEffectsByType<Effects.EffectAddAttackOption>(Effects.EffectType.addAttackOption);
  }

  getAddTrackerEffects(): EffectAndSource<Effects.EffectAddTracker>[] {
    return this.getEffectsByType<Effects.EffectAddTracker>(Effects.EffectType.addTracker);
  }

  getMeleeAttackAbilityEffects(): EffectAndSource<Effects.EffectMeleeAttackAbility>[] {
    return this.getEffectsByType<Effects.EffectMeleeAttackAbility>(
      Effects.EffectType.meleeAttackAbility
    );
  }

  getTwoHandDamageMultiplierEffects(): EffectAndSource<Effects.EffectTwoHandDamageMultiplier>[] {
    return this.getEffectsByType<Effects.EffectTwoHandDamageMultiplier>(
      Effects.EffectType.twoHandDamageMultiplier
    );
  }

  getGainBloodlineEffects(): EffectAndSource<Effects.EffectGainBloodline>[] {
    return this.getEffectsByType<Effects.EffectGainBloodline>(Effects.EffectType.gainBloodline);
  }

  getSelectFromSubsEffects(): EffectAndSource<Effects.EffectSelectFromSubs>[] {
    return this.getEffectsByType<Effects.EffectSelectFromSubs>(Effects.EffectType.selectFromSubs);
  }
}
