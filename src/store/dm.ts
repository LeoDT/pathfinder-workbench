import { observable, IObservableArray, makeObservable, action, computed } from 'mobx';
import shortid from 'shortid';

export interface DMCharacter {
  id: string;
  name: string;
  initiative: string;
  hp: string;
  rolledInitiative: number;
}

export default class DMStore {
  characters: IObservableArray<DMCharacter>;

  constructor() {
    makeObservable(this, {
      rollAllInitiative: action,
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
      initiative: '0',
      hp: '1',
      rolledInitiative: 0,
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

  getNonConflictName(name: string): string {
    const existed = this.characters.filter((c) => c.name.startsWith(name));

    return `${name} ${existed.length + 1}`;
  }
}
