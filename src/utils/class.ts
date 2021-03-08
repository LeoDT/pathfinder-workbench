import { Class, ClassFeat } from '../store/types';

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
