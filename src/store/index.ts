import Fuse from 'fuse.js';
import { del, entries, get, set } from 'idb-keyval';
import { IObservableArray, autorun, observable, observe } from 'mobx';

import { Entity, EntityType } from '../types/core';
import { createContextNoNullCheck } from '../utils/react';
import { Character } from './character';
import { Collection, collections } from './collection';
import { DMStore } from './dm';
import { Prestige } from './dm/prestige';
import { UIStore } from './ui';

const quickSearchCollections = [
  collections.spell,
  collections.feat,
  collections.weaponType,
  collections.armorType,
  collections.magicItemType,
];

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).store = this;
  }

  async init(): Promise<void> {
    await this.restore();
    this.persist();
  }

  quickSearch(key: string, limitEach = 20): Array<[EntityType, Fuse.FuseResult<Entity>[]]> {
    return (quickSearchCollections as Array<Collection<Entity>>).map((c) => [
      c.type,
      c.fuse.search(key, { limit: limitEach }),
    ]);
  }

  removeCharacter(c: Character): void {
    this.characters.remove(c);

    c.dispose();
  }

  persist(): void {
    autorun(() => {
      this.characters.forEach((c) => {
        set(`character:${c.id}`, Character.stringify(c));
      });

      set('dm:characters', JSON.stringify(this.dm.characters));

      this.dm.prestiges.forEach((p) => {
        set(`dm:prestige:${p.id}`, Prestige.stringify(p));
      });
    });

    observe(this.characters, (change) => {
      if (change.type === 'splice') {
        change.removed.forEach((i) => {
          del(`character:${i.id}`);
        });
      }
    });

    observe(this.dm.prestiges, (change) => {
      if (change.type === 'splice') {
        change.removed.forEach((i) => {
          del(`dm:prestige:${i.id}`);
        });
      }
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

        if (k.startsWith('dm:prestige')) {
          this.dm.prestiges.push(Prestige.parse(v));
        }
      }
    });
  }

  persistMisc(k: string, v: string): void {
    set(`misc:${k}`, v);
  }

  async restoreMisc(k: string): Promise<string> {
    return (await get(`misc:${k}`)) || '';
  }
}

export const [useStore, StoreContext] = createContextNoNullCheck<Store>();
