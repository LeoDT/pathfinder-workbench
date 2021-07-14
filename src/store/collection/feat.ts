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

  matchFeatIdWithInput(id: string): { id: string; input?: string } {
    const match = id.match(/^(.*?)\[(.*?)\]$/);

    if (match) {
      return { id: match[1], input: match[2] };
    }

    return { id };
  }

  getByIdsWithInputs(ids: string[]): Array<{ feat: Feat; input?: string }> {
    return ids.map((i) => {
      const { id, input } = this.matchFeatIdWithInput(i);

      return { feat: this.getById(id), input };
    });
  }
}
