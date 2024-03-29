import { intersection, range } from 'lodash-es';

import { Archetype, Class, ClassFeat, ClassFeatGrow, ClassLevel } from '../../types/core';
import { Collection, CollectionOptions } from './base';

export class ClassCollection extends Collection<Class> {
  constructor(data: Array<Class>, options?: CollectionOptions) {
    super('class', data, options);

    for (const i of this.data) {
      for (const f of i.feats) {
        f._type = 'classFeat';
      }
    }
  }

  growedClassFeatCache = new WeakMap<ClassFeatGrow, ClassFeat>();
  getGrowedClassFeat(feat: ClassFeat, grow: ClassFeatGrow): ClassFeat {
    const cached = this.growedClassFeatCache.get(grow);

    if (cached) return cached;

    const f: ClassFeat = {
      ...feat,
      ...grow,
      _type: 'classFeat',
      origin: feat,
    };

    this.growedClassFeatCache.set(grow, f);

    return f;
  }

  classFeatsCache = new WeakMap<Class | Archetype, ClassFeat[]>();
  getClassFeats(clas: Class | Archetype): ClassFeat[] {
    const cached = this.classFeatsCache.get(clas);

    if (cached) return cached;

    const feats = clas.feats
      .map((f) => {
        if (f.grow) {
          return f.grow.map((g) => this.getGrowedClassFeat(f, g));
        }

        return f;
      })
      .flat();

    this.classFeatsCache.set(clas, feats);

    return feats;
  }

  getClassFeatsByLevel(clas: Class, l: number, archetypes: Archetype[] = []): ClassFeat[] {
    const level = this.getClassLevel(clas, l);
    const archetypeFeats = archetypes.map((a) => this.getClassFeats(a)).flat();

    const feats = level.special?.map((s) => {
      const feat = this.getClassFeats(clas).find((f) => f.id === s);

      if (feat) {
        const replace = archetypeFeats.find((af) => {
          return af.replace?.includes(feat.origin?.id ?? '') || af.replace?.includes(feat.id);
        });

        if (replace) return replace;

        return feat;
      } else {
        throw Error(`class feat ${s} for ${clas.id} not found`);
      }
    });

    return feats || [];
  }

  getHighestLevelForAchetype(clas: Class, archetype: Archetype): number {
    const replaces = archetype.feats.map((f) => f.replace || []).flat();

    let highest = 99;

    if (!replaces) {
      return highest;
    }

    for (const l of range(1, clas.levels.length + 1)) {
      const featIds = this.getClassFeatsByLevel(clas, l).map((f) => f.origin?.id ?? f.id);

      if (intersection(featIds, replaces).length > 0) {
        highest = l;
        break;
      }
    }

    return highest;
  }

  getClassLevel(clas: Class, l: number): ClassLevel {
    const level = clas.levels[l - 1];

    if (level) {
      return level;
    }

    throw new Error(`class ${clas.id} do no have level ${l}`);
  }
}
