import { Class, ClassLevel, ClassFeat } from '../types/core';

import { collections } from '../store/collection';

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
      let hit = null;

      clas.feats.forEach((f) => {
        if (f.grow) {
          const g = f.grow.find((fg) => fg.id === s);

          if (g) {
            hit = collections.class.getGrowedClassFeat(f, g);

            return false;
          }
        }

        if (f.id === s) {
          hit = f;
        }
      });

      if (hit) {
        return hit;
      }

      throw Error(`class feat ${s} for ${clas.id} not found`);
    }) || []
  );
}
