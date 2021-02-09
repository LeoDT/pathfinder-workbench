import Fuse from 'fuse.js';

import { EntityTypes } from './types';

export type CollectionType = 'spell' | 'weapon';

export interface CollectionOptions {
  searchFields: Array<string>;
}

export class Collection<T = EntityTypes> {
  type: CollectionType;
  data: Array<T>;

  fuse: Fuse<T>;

  constructor(type: CollectionType, data: Array<T>, options: CollectionOptions) {
    this.type = type;
    this.data = data;

    this.fuse = new Fuse(data, {
      includeScore: true,
      threshold: 0.2,

      keys: options.searchFields,
    });
  }
}
