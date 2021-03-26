import { range } from 'lodash-es';
import { Class, ClassLevel, ClassFeat } from '../types/core';
import { ClassSpecialityType } from '../types/characterUpgrade';
import { EffectGainClassSpeciality, EffectGainSpellCasting, EffectType } from '../types/effectType';

export function getClassLevel(clas: Class, l: number): ClassLevel {
  const level = clas.levels[l - 1];

  if (level) {
    return level;
  }

  throw new Error(`class ${clas.id} do no have level ${l}`);
}

export function getClassFeatByLevel(clas: Class, l: number): Array<ClassFeat> {
  const level = getClassLevel(clas, l);

  return (
    level.special?.map((s) => {
      const f = clas.feats.find((f) => {
        if (f.grow) {
          const g = f.grow.find((fg) => fg.id === s);

          if (g) {
            return {
              ...g,
              desc: f.desc,
            };
          }
        }

        return f.id === s;
      });

      if (f) {
        return f;
      }

      throw Error(`class feat ${s} for ${clas.id} not found`);
    }) || []
  );
}

export const classSpecialtyTranslates = {
  [ClassSpecialityType.arcaneSchool]: '奥术学派',
};

export const gainClassSpecialityEffectType = [EffectType.gainArcaneSchool];

export function getClassSpecialityTypeFromEffect(
  effect: EffectGainClassSpeciality
): ClassSpecialityType {
  switch (effect.type) {
    case EffectType.gainArcaneSchool:
      return ClassSpecialityType.arcaneSchool;
    default:
      throw Error(`Unknown EffectGainClassSpeciality.type ${effect.type}`);
  }
}

export function getSpellCastingEffectFromClassLevel(
  clas: Class,
  level: number
): EffectGainSpellCasting | null {
  const feats = range(level)
    .map((l) => getClassFeatByLevel(clas, l + 1))
    .flat();

  let effect = null;

  feats.forEach((f) =>
    f.effects?.forEach((e) => {
      if (e.type === EffectType.gainSpellCasting) {
        effect = e;
      }
    })
  );

  return effect;
}
