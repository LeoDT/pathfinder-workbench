import Fuse from 'fuse.js';
import { observable, IObservableArray, autorun } from 'mobx';
import { set, entries } from 'idb-keyval';

import { createContextNoNullCheck } from '../utils/react';

import { Entity } from './types';
import DMStore from './dm';
import UIStore from './ui';
import { collections, Collection, CollectionEntityType } from './collection';
import Character from './character';

export class Store {
  dm: DMStore;
  ui: UIStore;

  collections: typeof collections; // for components

  characters: IObservableArray<Character>;

  constructor() {
    this.dm = new DMStore();

    this.ui = new UIStore();
    this.collections = collections;

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
    return ([collections.spell, collections.feat] as Array<Collection<Entity>>).map((c) => [
      c.type,
      c.fuse.search(key, { limit: limitEach }),
    ]);
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
          this.characters.push(Character.parse(v));
        }

        if (k === 'dm:characters') {
          this.dm.characters.replace(DMStore.parseCharacters(v));
        }
      }
    });

    if (this.characters.length < 1) {
      this.characters.push(new Character('Default'));
    }
  }
}

export const [useStore, StoreContext] = createContextNoNullCheck<Store>();
