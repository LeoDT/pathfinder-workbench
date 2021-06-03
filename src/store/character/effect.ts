import { computed, makeObservable } from 'mobx';

import { ArcaneSchool } from '../../types/arcaneSchool';
import { Class, ClassFeat, Feat, RacialTrait } from '../../types/core';
import * as Effects from '../../types/effectType';
import { getClassFeatByLevel } from '../../utils/class';
import { makeEffectInputKey, validateGainArcaneSchoolEffectInput } from '../../utils/effect';
import { collections } from '../collection';
import Character from '.';

export type EntityTypesValidForEffectSource = 'racialTrait' | 'classFeat' | 'feat' | 'arcaneSchool';
export type EffectSource = RacialTrait | ClassFeat | Feat | ArcaneSchool;
export interface EffectAndSource<T = Effects.Effect> {
  effect: T;
  source: EffectSource;
  input?: unknown;
}

export default class CharacterEffect {
  character: Character;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  growedEffectCache: WeakMap<any, Effects.Effect>;

  constructor(character: Character) {
    makeObservable(this, {
      gainedFeatsWithEffectInputs: computed,
      allEffects: computed,
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
        const classFeatsForLevel = getClassFeatByLevel(clas, i + 1);

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
        const school = collections.arcaneSchool.getById(realInput.school);
        const newES = school.effects?.map((effect) => ({ effect, source: school })) ?? [];

        return [es, ...newES];
      }

      default:
        return es;
    }
  }

  get allEffects(): Array<EffectAndSource> {
    const effects: Array<EffectAndSource> = [];
    const add = (es: EffectAndSource) => {
      if (es.effect.when && this.character.formulaParserReady) {
        const result = this.character.parseFormula(es.effect.when);

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
    };

    this.character.racialTraits.forEach((source) => {
      source.effects?.forEach((effect) => {
        add({
          effect: this.growEffectArgs(effect, source),
          source,
          input: this.getEffectInputForRacialTrait(source),
        });
      });
    });

    this.character.gainedClassFeats.forEach((feats, clas) => {
      feats.forEach((source) => {
        source.effects?.forEach((effect) => {
          add({
            effect: this.growEffectArgs(effect, source),
            source,
            input: this.getEffectInputForClassFeat(clas, source),
          });
        });
      });
    });

    this.gainedFeatsWithEffectInputs.forEach(({ feat: source, input }) => {
      source.effects?.forEach((effect) => {
        add({ effect: this.growEffectArgs(effect, source), source, input });
      });
    });

    return effects.map((e) => this.extendEffect(e)).flat();
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
      original: e,
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

  getEffectsFromClassFeats(feats: ClassFeat[]): Array<EffectAndSource> {
    const effects: Array<EffectAndSource> = [];

    feats.forEach((source) => {
      source.effects?.forEach((effect) => {
        effects.push({ effect: this.growEffectArgs(effect, source), source });
      });
    });

    return effects;
  }

  getEffectsNeedInput(): EffectAndSource<Effects.EffectNeadInput>[] {
    return Effects.effectTypesNeedInput
      .map((t) => this.getEffectsByType<Effects.EffectNeadInput>(t))
      .flat();
  }

  getGainFeatEffects(fromEffects?: EffectAndSource[]): EffectAndSource<Effects.EffectGainFeat>[] {
    return this.getEffectsByType<Effects.EffectGainFeat>(Effects.EffectType.gainFeat, fromEffects);
  }

  getGainArcaneSchoolEffects(): EffectAndSource<Effects.EffectGainArcaneSchool>[] {
    return this.getEffectsByType<Effects.EffectGainArcaneSchool>(
      Effects.EffectType.gainArcaneSchool
    );
  }

  getGainArcaneSchoolPrepareSlotEffects(): EffectAndSource<Effects.EffectGainArcaneSchoolPrepareSlot>[] {
    return this.getEffectsByType<Effects.EffectGainArcaneSchoolPrepareSlot>(
      Effects.EffectType.gainArcaneSchoolPrepareSlot
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
}
