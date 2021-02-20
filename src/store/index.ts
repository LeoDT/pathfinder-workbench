import Fuse from 'fuse.js';
import { observable, IObservableArray, autorun } from 'mobx';
import { set, entries } from 'idb-keyval';

import SPELL_DATA from '../data/spells.json';
import FEAT_DATA from '../data/feats.json';
import { createContextNoNullCheck } from '../utils/react';

import { Entity, Spell, Feat } from './types';
import DMStore from './dm';
import { Collection, CollectionEntityType } from './collection';
import Character from './character';

export class Store {
  dm: DMStore;
  collections: Array<Collection>;

  characters: IObservableArray<Character>;

  constructor() {
    this.dm = new DMStore();

    this.collections = [
      new Collection<Spell>('spell', SPELL_DATA, {
        searchFields: ['id', 'name'],
      }),
      new Collection<Feat>('feat', FEAT_DATA, {
        searchFields: ['id', 'name'],
      }),
    ];

    this.characters = observable.array([], { deep: false });
  }

  async init(): Promise<void> {
    await this.restore();
    this.persist();
  }

  quickSearch(
    key: string,
    limitEach = 20
  ): Array<[CollectionEntityType, Fuse.FuseResult<Entity>[]]> {
    return this.collections.map((c) => [c.type, c.fuse.search(key, { limit: limitEach })]);
  }

  persist(): void {
    autorun(() => {
      this.characters.forEach((c) => {
        set(`character:${c.id}`, Character.stringify(c));
      });

      set('dm:characters', JSON.stringify(this.dm.characters));
    });
  }

  async restore(): Promise<void> {
    const persisted = await entries();

    persisted.forEach(([k, v]) => {
      if (typeof k === 'string') {
        if (k.startsWith('character')) {
          this.characters.push(Character.parse(v, this.collections[0] as Collection<Spell>));
        }

        if (k === 'dm:characters') {
          this.dm.characters.replace(JSON.parse(v));
        }
      }
    });

    if (this.characters.length < 1) {
      this.characters.push(new Character('Default'));
    }
  }
}

export const [useStore, StoreContext] = createContextNoNullCheck<Store>();
