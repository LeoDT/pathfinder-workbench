import Fuse from 'fuse.js';

import { Entity } from './types';

export type CollectionEntityType = 'spell' | 'weapon';

export interface CollectionOptions {
  searchFields: Array<string>;
}

export class Collection<T extends Entity = Entity> {
  type: CollectionEntityType;
  data: Array<T>;

  fuse: Fuse<T>;

  constructor(type: CollectionEntityType, data: Array<T>, options: CollectionOptions) {
    this.type = type;
    this.data = data;

    this.fuse = new Fuse(data, {
      includeScore: true,
      threshold: 0.2,

      keys: options.searchFields,
    });
  }

  getById(id: string): T | null {
    return this.data.find((s) => s.id === id) || null;
  }
}
