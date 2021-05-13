import { cloneDeep } from 'lodash-es';
import { observable, IObservableArray, makeObservable, action, computed } from 'mobx';
import shortid from 'shortid';

export interface Tracker {
  id: string;
  name: string;
  remain: number;
  max: string;
}

export interface DMCharacter {
  id: string;
  name: string;
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

export default class DMStore {
  characters: IObservableArray<DMCharacter>;

  constructor() {
    makeObservable(this, {
      rollAllInitiative: action,
      rollAllPerception: action,
      rollAllSenseMotive: action,
      rollAllWillSave: action,

      healAll: action,

      addTracker: action,
      recoverTracker: action,
      recoverAllTracker: action,
      recoverAllAttunment: action,

      sortedCharacters: computed,
    });

    this.characters = observable.array([]);
  }

  get sortedCharacters(): Array<DMCharacter> {
    return [...this.characters].sort((a, b) => {
      const ac = parseInt(a.initiative) + a.rolledInitiative;
      const bc = parseInt(b.initiative) + b.rolledInitiative;

      return bc - ac;
    });
  }

  addCharacter(name: string): void {
    this.characters.push({
      id: shortid(),
      name: this.getNonConflictName(name),
      ...cloneDeep(DEFAULT_CHARACTER_PROPS),
    });
  }

  removeCharacter(c: DMCharacter): void {
    this.characters.remove(c);
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
    const existed = this.characters.filter((c) => c.name.startsWith(name));

    return `${name} ${existed.length + 1}`;
  }

  static parseCharacters(s: string): Array<DMCharacter> {
    const json = JSON.parse(s);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return json.map((c: any) => ({
      ...DEFAULT_CHARACTER_PROPS,
      ...c,
    }));
  }
}
