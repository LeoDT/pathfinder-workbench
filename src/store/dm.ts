import { observable, IObservableArray, makeObservable, action, computed } from 'mobx';
import shortid from 'shortid';

const DEFAULT_CHARACTER_PROPS = {
  initiative: '0',
  hp: '1',
  maxHP: '10',
  perception: '0',
  rolledInitiative: 0,
  rolledPerception: 0,
};

export interface DMCharacter {
  id: string;
  name: string;
  initiative: string;
  hp: string;
  maxHP: string;
  perception: string;
  rolledInitiative: number;
  rolledPerception: number;
}

export default class DMStore {
  characters: IObservableArray<DMCharacter>;

  constructor() {
    makeObservable(this, {
      rollAllInitiative: action,
      rollAllPerception: action,
      healAll: action,
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
      ...DEFAULT_CHARACTER_PROPS,
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

  rollPerception(c: DMCharacter): void {
    c.rolledPerception = Math.ceil(Math.random() * 20);
  }

  rollAllPerception(): void {
    this.characters.forEach((c) => this.rollPerception(c));
  }

  heal(c: DMCharacter): void {
    c.hp = c.maxHP;
  }
  healAll(): void {
    this.characters.forEach((c) => {
      c.hp = c.maxHP;
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
