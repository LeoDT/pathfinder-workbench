import { computed, makeObservable } from 'mobx';

import { Class, ClassFeat, Feat, RacialTrait } from '../../types/core';
import {
  ArgsTypeForEffect,
  BaseEffect,
  Effect,
  EffectAbilityBonus,
  EffectGainAC,
  EffectGainArcaneSchool,
  EffectGainFavoredClassAmount,
  EffectGainFeat,
  EffectGainInitiative,
  EffectGainProficiency,
  EffectGainSave,
  EffectGainSelectedWeaponProficiency,
  EffectGainSkill,
  EffectGainSpellCasting,
  EffectGainTwoWeaponFighting,
  EffectNeadInput,
  EffectType,
  effectTypesNeedInput,
} from '../../types/effectType';
import { getClassFeatByLevel } from '../../utils/class';
import { makeEffectInputKey } from '../../utils/effect';
import { collections } from '../collection';
import Character from '.';

export type EffectSource = RacialTrait | ClassFeat | Feat;
export interface EffectAndSource<T = Effect> {
  effect: T;
  source: EffectSource;
  input?: unknown;
}

export default class CharacterEffect {
  character: Character;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  growedEffectCache: WeakMap<any, Effect>;

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

  get allEffects(): Array<EffectAndSource> {
    const effects: Array<EffectAndSource> = [];

    this.character.racialTraits.forEach((source) => {
      source.effects?.forEach((effect) => {
        effects.push({
          effect: this.growEffectArgs(effect, source),
          source,
          input: this.getEffectInputForRacialTrait(source),
        });
      });
    });

    this.character.gainedClassFeats.forEach((feats, clas) => {
      feats.forEach((source) => {
        source.effects?.forEach((effect) => {
          effects.push({
            effect: this.growEffectArgs(effect, source),
            source,
            input: this.getEffectInputForClassFeat(clas, source),
          });
        });
      });
    });

    this.gainedFeatsWithEffectInputs.forEach(({ feat: source, input }) => {
      source.effects?.forEach((effect) => {
        effects.push({ effect: this.growEffectArgs(effect, source), source, input });
      });
    });

    return effects;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getEffectsByType<T extends BaseEffect<any, any>>(
    t: EffectType,
    fromEffects?: Array<EffectAndSource>
  ): EffectAndSource<T>[] {
    return (fromEffects ?? this.allEffects).filter(
      (es): es is EffectAndSource<T> => es.effect.type === t
    );
  }

  private makeGrowedEffect<T extends Effect>(
    e: T,
    g: { level: number; args: ArgsTypeForEffect<T> }
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

  private growEffectArgs<T extends Effect>(e: T, source: EffectSource): T {
    if (!e.growArgs) return e;

    let level = 0;
    switch (source._type) {
      case 'racialTrait':
      case 'feat':
        level = this.character.level;
        break;
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
    }

    if (level > 0) {
      for (let i = e.growArgs.length - 1; i > 0; i--) {
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

  getEffectsNeedInput(): EffectAndSource<EffectNeadInput>[] {
    return effectTypesNeedInput.map((t) => this.getEffectsByType<EffectNeadInput>(t)).flat();
  }

  getGainFeatEffects(fromEffects?: EffectAndSource[]): EffectAndSource<EffectGainFeat>[] {
    return this.getEffectsByType<EffectGainFeat>(EffectType.gainFeat, fromEffects);
  }

  getGainArcaneSchoolEffects(): EffectAndSource<EffectGainArcaneSchool>[] {
    return this.getEffectsByType<EffectGainArcaneSchool>(EffectType.gainArcaneSchool);
  }

  getAbilityBonusEffects(): EffectAndSource<EffectAbilityBonus>[] {
    return this.getEffectsByType<EffectAbilityBonus>(EffectType.abilityBonus);
  }

  getGainSpellCastingEffects(): EffectAndSource<EffectGainSpellCasting>[] {
    return this.getEffectsByType<EffectGainSpellCasting>(EffectType.gainSpellCasting);
  }

  getGainFavoredClassAmountEffects(): EffectAndSource<EffectGainFavoredClassAmount>[] {
    return this.getEffectsByType<EffectGainFavoredClassAmount>(EffectType.gainFavoredClassAmount);
  }

  getGainProficiencyEffects(): EffectAndSource<EffectGainProficiency>[] {
    return this.getEffectsByType<EffectGainProficiency>(EffectType.gainProficiency);
  }

  getGainSelectedWeaponProficiencyEffects(): EffectAndSource<EffectGainSelectedWeaponProficiency>[] {
    return this.getEffectsByType<EffectGainSelectedWeaponProficiency>(
      EffectType.gainSelectedWeaponProficiency
    );
  }

  getGainSkillEffects(): EffectAndSource<EffectGainSkill>[] {
    return this.getEffectsByType<EffectGainSkill>(EffectType.gainSkill);
  }

  getGainInitiativeEffects(): EffectAndSource<EffectGainInitiative>[] {
    return this.getEffectsByType<EffectGainInitiative>(EffectType.gainInitiative);
  }

  getGainACEffects(): EffectAndSource<EffectGainAC>[] {
    return this.getEffectsByType<EffectGainAC>(EffectType.gainAC);
  }

  getGainSaveEffects(): EffectAndSource<EffectGainSave>[] {
    return this.getEffectsByType<EffectGainSave>(EffectType.gainSave);
  }

  getGainTwoWeaponFightingEffects(): EffectAndSource<EffectGainTwoWeaponFighting>[] {
    return this.getEffectsByType<EffectGainTwoWeaponFighting>(EffectType.gainTwoWeaponFighting);
  }
}
