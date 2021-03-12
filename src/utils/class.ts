import { Class, ClassFeat } from '../types/core';
import { ClassSpecialityType } from '../types/characterUpgrade';
import { EffectGainClassSpeciality, EffectType } from '../types/effectType';

export function getClassFeatByLevel(clas: Class, l: number): Array<ClassFeat> {
  const level = clas.levels[l - 1];

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
