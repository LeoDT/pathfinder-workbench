import { Class, ClassFeat, ClassFeatGrow } from '../../types/core';

import { Collection, CollectionOptions } from './base';

export default class ClassCollection extends Collection<Class> {
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
      ...grow,
      _type: 'classFeat',
      desc: feat.desc,
      original: feat,
    };

    this.growedClassFeatCache.set(grow, f);

    return f;
  }
}
