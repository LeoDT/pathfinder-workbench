import { computed, makeObservable } from 'mobx';

import { ClassFeat, Feat, RacialTrait } from '../../types/core';
import {
  ArgsTypeForEffect,
  BaseEffect,
  Effect,
  EffectAbilityBonus,
  EffectGainArcaneSchool,
  EffectGainFavoredClassAmount,
  EffectGainFeat,
  EffectGainSpellCasting,
  EffectGainProficiency,
  EffectGainSelectedWeaponProficiency,
  EffectType,
  EffectNeadInput,
  effectTypesNeedInput,
} from '../../types/effectType';
import Character from '.';

export type EffectSource = RacialTrait | ClassFeat | Feat;
export interface EffectAndSource<T = Effect> {
  effect: T;
  source: EffectSource;
}

export default class CharacterEffect {
  character: Character;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  growedEffectCache: WeakMap<any, Effect>;

  constructor(character: Character) {
    makeObservable(this, {
      allEffects: computed,
    });

    this.character = character;
    this.growedEffectCache = new WeakMap();
  }

  get allEffects(): Array<EffectAndSource> {
    const effects: Array<EffectAndSource> = [];

    this.character.racialTraits.forEach((source) => {
      source.effects?.forEach((effect) => {
        effects.push({ effect: this.growEffectArgs(effect, source), source });
      });
    });

    this.character.gainedClassFeats.forEach((feats) => {
      feats.forEach((source) => {
        source.effects?.forEach((effect) => {
          effects.push({ effect: this.growEffectArgs(effect, source), source });
        });
      });
    });

    this.character.gainedFeats.forEach((source) => {
      source.effects?.forEach((effect) => {
        effects.push({ effect: this.growEffectArgs(effect, source), source });
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
}
