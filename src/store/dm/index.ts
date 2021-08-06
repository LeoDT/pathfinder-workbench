import { cloneDeep } from 'lodash-es';
import { IObservableArray, makeAutoObservable, observable, observe, toJS } from 'mobx';
import shortid from 'shortid';

import { nonConflictName } from '../../utils/misc';
import { Prestige } from './prestige';
import { DMCharacter, DMCharacterType, PrestigeTemplate } from './types';

const DEFAULT_CHARACTER_PROPS = {
  hp: '1',
  disabled: false,
  maxHP: '10',
  attunement: '0',
  initiative: '0',
  perception: '0',
  willSave: '0',
  senseMotive: '0',
  rolledInitiative: 0,
  rolledPerception: 0,
  rolledSenseMotive: 0,
  rolledWillSave: 0,
  trackers: [],
};

export interface PrestigeFaction {
  id: string;
  name: string;
}

export interface PrestigeCharacter {
  id: string;
  name: string;
}

export interface PrestigeLevel {
  id: string;
  name: string;
  max: number;
}

export interface Prestiges {
  factions: IObservableArray<PrestigeFaction>;
  characters: IObservableArray<PrestigeCharacter>;
  levels: IObservableArray<PrestigeLevel>;
  prestige: Map<string, number>;
}

export class DMStore {
  characters: IObservableArray<DMCharacter>;
  prestiges: IObservableArray<Prestige>;

  constructor() {
    makeAutoObservable(this);

    this.characters = observable.array([]);
    this.prestiges = observable.array([]);

    observe(this.characters, (change) => {
      if (change.type === 'splice') {
        const removed = change.removed.map((c) => c.id);

        this.prestiges.forEach((p) => {
          const toRemove: string[] = [];

          p.prestiges.forEach((_, k) => {
            const id = k.split(':')[1];

            if (removed.includes(id)) {
              toRemove.push(k);
            }
          });

          toRemove.forEach((k) => p.prestiges.delete(k));
        });
      }
    });
  }

  get sortedCharacters(): Array<DMCharacter> {
    return [...this.characters].sort((a, b) => {
      const ac = parseInt(a.initiative) + a.rolledInitiative;
      const bc = parseInt(b.initiative) + b.rolledInitiative;

      return bc - ac;
    });
  }

  get players(): DMCharacter[] {
    return this.characters.filter((c) => c.type === 'player');
  }

  addCharacter(
    type: DMCharacterType,
    name: string,
    props?: Partial<Omit<DMCharacter, 'id' | 'name' | 'type'>>
  ): void {
    this.characters.push({
      id: shortid(),
      name: this.getNonConflictName(name),
      type,
      ...cloneDeep(DEFAULT_CHARACTER_PROPS),
      ...props,
    });
  }

  removeCharacter(c: DMCharacter): void {
    this.characters.remove(c);
  }

  copyCharacter(c: DMCharacter): void {
    let name = c.name;
    if (c.name.search(/\s(\d+)$/) !== -1) {
      name = c.name.replace(/\s(\d+)$/, '');
    }

    name = this.getNonConflictName(name);

    this.characters.push({
      ...cloneDeep(toJS(c)),
      id: shortid(),
      name,
    });
  }

  rollInitiative(c: DMCharacter): void {
    c.rolledInitiative = Math.ceil(Math.random() * 20);
  }
  rollAllInitiative(): void {
    this.characters.forEach((c) => this.rollInitiative(c));
  }
  getFinalInitiative(c: DMCharacter): number {
    return parseInt(c.initiative) + c.rolledInitiative;
  }

  rollPerception(c: DMCharacter): void {
    c.rolledPerception = Math.ceil(Math.random() * 20);
  }
  rollAllPerception(): void {
    this.characters.forEach((c) => this.rollPerception(c));
  }
  getFinalPerception(c: DMCharacter): number {
    return parseInt(c.perception) + c.rolledPerception;
  }

  rollSenseMotive(c: DMCharacter): void {
    c.rolledSenseMotive = Math.ceil(Math.random() * 20);
  }
  rollAllSenseMotive(): void {
    this.characters.forEach((c) => this.rollSenseMotive(c));
  }

  rollWillSave(c: DMCharacter): void {
    c.rolledWillSave = Math.ceil(Math.random() * 20);
  }
  rollAllWillSave(): void {
    this.characters.forEach((c) => this.rollWillSave(c));
  }
  getFinalWillSave(c: DMCharacter): number {
    return parseInt(c.willSave) + c.rolledWillSave;
  }

  heal(c: DMCharacter): void {
    c.hp = c.maxHP;
  }
  healAll(): void {
    this.characters.forEach((c) => {
      c.hp = c.maxHP;
    });
  }

  addTracker(c: DMCharacter): void {
    c.trackers.push({
      id: shortid(),
      name: 'New Tracker',
      remain: 0,
      max: '0',
    });
  }
  recoverTracker(c: DMCharacter): void {
    c.trackers.forEach((t) => {
      t.remain = parseInt(t.max);
    });
  }
  recoverAllTracker(): void {
    this.characters.forEach((c) => this.recoverTracker(c));
  }

  recoverAllAttunment(): void {
    this.characters.forEach((c) => {
      c.attunement = '0';
    });
  }

  getNonConflictName(name: string): string {
    return nonConflictName(
      name,
      this.characters.map((c) => c.name)
    );
  }

  createPrestige(name: string, template?: PrestigeTemplate): Prestige {
    const allNames = this.prestiges.map((p) => p.name);
    const p = new Prestige(nonConflictName(name, allNames));

    if (template?.levels) {
      template.levels.forEach((n) => {
        p.addPrestigeLevel(n);
      });
    }

    this.prestiges.push(p);

    return p;
  }

  removePrestige(p: Prestige): void {
    this.prestiges.remove(p);
    p.dispose();
  }

  static parseCharacters(s: string): Array<DMCharacter> {
    const json = JSON.parse(s);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return json.map((c: any) => ({
      type: 'player', // default type for saved character
      ...DEFAULT_CHARACTER_PROPS,
      ...c,
    }));
  }
}
