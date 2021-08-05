import { cloneDeep, without } from 'lodash-es';
import { IObservableArray, action, computed, makeObservable, observable, toJS } from 'mobx';
import shortid from 'shortid';

import { nonConflictName } from '../utils/misc';

export interface Tracker {
  id: string;
  name: string;
  remain: number;
  max: string;
}

export type DMCharacterType = 'player' | 'npc' | 'enemy';
export interface DMCharacter {
  id: string;
  syncId?: string;
  name: string;
  type: DMCharacterType;
  hp: string;
  maxHP: string;
  attunement: string;
  initiative: string;
  perception: string;
  senseMotive: string;
  willSave: string;
  rolledInitiative: number;
  rolledPerception: number;
  rolledSenseMotive: number;
  rolledWillSave: number;
  trackers: Array<Tracker>;
}

const DEFAULT_CHARACTER_PROPS = {
  hp: '1',
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
  prestiges: Prestiges;

  constructor() {
    makeObservable(this, {
      rollAllInitiative: action,
      rollAllPerception: action,
      rollAllSenseMotive: action,
      rollAllWillSave: action,
      rollInitiative: action,
      rollPerception: action,
      rollSenseMotive: action,
      rollWillSave: action,

      healAll: action,

      addTracker: action,
      recoverTracker: action,
      recoverAllTracker: action,
      recoverAllAttunment: action,

      addCharacter: action,
      addPrestigeCharacter: action,
      addPrestigeFaction: action,
      addPrestigeLevel: action,
      removeCharacter: action,
      removePrestigeCharacter: action,
      removePrestigeFaction: action,
      removePrestigeLevel: action,
      increasePresitge: action,
      decreasePresitge: action,

      sortedCharacters: computed,
    });

    this.characters = observable.array([]);
    this.prestiges = observable({
      levels: observable.array([]),
      factions: observable.array([]),
      characters: observable.array([]),
      prestige: new Map<string, number>(),
    });
  }

  get sortedCharacters(): Array<DMCharacter> {
    return [...this.characters].sort((a, b) => {
      const ac = parseInt(a.initiative) + a.rolledInitiative;
      const bc = parseInt(b.initiative) + b.rolledInitiative;

      return bc - ac;
    });
  }

  addCharacter(
    type: DMCharacterType,
    name: string,
    props?: Partial<Omit<DMCharacter, 'id' | 'name'>>
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

  addPrestigeLevel(name: string, max = 3): void {
    const allNames = this.prestiges.levels.map((c) => c.name);

    this.prestiges.levels.push({ id: shortid(), name: nonConflictName(name, allNames), max });
  }

  removePrestigeLevel(c: PrestigeLevel): void {
    this.prestiges.levels.remove(c);
  }

  addPrestigeCharacter(name: string): void {
    const allNames = this.prestiges.characters.map((c) => c.name);

    this.prestiges.characters.push({ id: shortid(), name: nonConflictName(name, allNames) });
  }

  removePrestigeCharacter(c: PrestigeCharacter): void {
    this.prestiges.characters.remove(c);
  }

  addPrestigeFaction(name: string, max = 3): void {
    const allNames = this.prestiges.factions.map((c) => c.name);

    this.prestiges.factions.push({ id: shortid(), name: nonConflictName(name, allNames) });
  }

  removePrestigeFaction(f: PrestigeFaction): void {
    this.prestiges.factions.remove(f);
  }

  getPrestigeLevel(prestige: number): [PrestigeLevel | null, number] {
    let level = this.prestiges.levels[0] || null;
    let p = prestige;

    for (const [i, l] of this.prestiges.levels.entries()) {
      if (p - l.max > 0) {
        level = l;
        p = i < this.prestiges.levels.length - 1 ? p - l.max : p;

        continue;
      }

      level = l;
      break;
    }

    return [level, p];
  }

  showPrestige(prestige: number): string {
    const [l, p] = this.getPrestigeLevel(prestige);

    return `${l?.name ? l.name : '无'}${p > 0 ? `(${p})` : ''}`;
  }

  increasePresitge(f: PrestigeFaction, c: PrestigeCharacter): void {
    const id = `${f.id}:${c.id}`;
    const p = this.prestiges.prestige.get(id) || 0;

    this.prestiges.prestige.set(id, p + 1);
  }
  decreasePresitge(f: PrestigeFaction, c: PrestigeCharacter): void {
    const id = `${f.id}:${c.id}`;
    const p = this.prestiges.prestige.get(id) || 0;

    this.prestiges.prestige.set(id, Math.max(p - 1, 0));
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
