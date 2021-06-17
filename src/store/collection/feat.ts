import { Feat, FeatType } from '../../types/core';
import { Collection, CollectionOptions } from './base';

export class FeatCollection extends Collection<Feat> {
  indexByType: Map<FeatType, Feat[]>;

  constructor(data: Array<Feat>, options?: CollectionOptions) {
    super('feat', data, options);

    this.indexByType = new Map();

    for (const f of this.data) {
      for (const t of f.type) {
        if (!this.indexByType.has(t)) {
          this.indexByType.set(t, []);
        }

        this.indexByType.get(t)?.push(f);
      }
    }
  }

  getByType(t: FeatType): Feat[] {
    return this.indexByType.get(t) ?? [];
  }

  getByIdsWithInputs(ids: string[]): Array<{ feat: Feat; input?: string }> {
    return ids.map((i) => {
      const match = i.match(/^(.*?)\[(.*?)\]$/);

      if (match) {
        const [, id, input] = match;

        return { feat: this.getById(id), input };
      }

      return { feat: this.getById(i), input: undefined };
    });
  }
}
