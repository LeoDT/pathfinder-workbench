import { intersection } from 'lodash-es';

import { Archetype, Class } from '../../types/core';
import { Collection, CollectionOptions } from './base';

export class ArchetypeCollection extends Collection<Archetype> {
  constructor(data: Array<Archetype>, options?: CollectionOptions) {
    super('archetype', data, options);

    for (const i of this.data) {
      for (const f of i.feats) {
        f._type = 'classFeat';
      }
    }
  }

  getByClass(clas: Class): Array<Archetype> {
    return this.data.filter((a) => a.class === clas.id);
  }

  noConflictArchetypes(clas: Class, archetypeIds: string[]): Archetype[] {
    const allArchetypes = this.getByClass(clas);
    const archetypes = this.getByIds(archetypeIds);
    const replaces = archetypes.map((a) => a.feats.map((f) => f.replace || []).flat()).flat();

    return allArchetypes.filter((a) =>
      a.feats.every((f) => intersection(replaces, f.replace || []).length === 0)
    );
  }
}
