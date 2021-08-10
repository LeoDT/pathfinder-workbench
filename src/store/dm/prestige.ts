import { pick, range } from 'lodash-es';
import { IObservableArray, makeAutoObservable, observable, observe } from 'mobx';
import shortid from 'shortid';

import { nonConflictName } from '../../utils/misc';
import { DMCharacter, PrestigeFaction, PrestigeLevel, PrestigeTemplate } from './types';

export const prestigeTemplates: PrestigeTemplate[] = [
  { name: '好感度', levels: ['友好', '信赖', '亲密', '恋人'] },
];

export class Prestige {
  id: string;
  name: string;
  indicators?: string;

  factions: IObservableArray<PrestigeFaction>;
  levels: IObservableArray<PrestigeLevel>;

  prestiges: Map<string, number>;
  disposes: Array<() => void>;

  constructor(name: string, id?: string, indicators?: string) {
    makeAutoObservable(this);

    this.id = id ?? shortid();
    this.name = name;
    this.indicators = indicators ?? '';

    this.levels = observable.array([]);
    this.factions = observable.array([]);

    this.prestiges = new Map();
    this.disposes = [];

    this.disposes.push(
      observe(this.factions, (change) => {
        if (change.type === 'splice') {
          const removed = change.removed.map((f) => f.id);
          const toRemove: string[] = [];

          this.prestiges.forEach((_, k) => {
            const id = k.split(':')[0]; // factionId

            if (removed.includes(id)) {
              toRemove.push(k);
            }
          });

          toRemove.forEach((k) => this.prestiges.delete(k));
        }
      })
    );
  }

  dispose(): void {
    this.disposes.forEach((d) => d());
  }

  addPrestigeLevel(name: string, max = 3): void {
    const allNames = this.levels.map((c) => c.name);

    this.levels.push({ id: shortid(), name: nonConflictName(name, allNames), max });
  }

  removePrestigeLevel(c: PrestigeLevel): void {
    this.levels.remove(c);
  }

  addPrestigeFaction(name: string): void {
    const allNames = this.factions.map((c) => c.name);

    this.factions.push({ id: shortid(), name: nonConflictName(name, allNames) });
  }

  removePrestigeFaction(f: PrestigeFaction): void {
    this.factions.remove(f);
  }

  getPrestigeLevel(prestige: number): [PrestigeLevel | null, number] {
    let level = this.levels[0] || null;
    let p = prestige;

    for (const [i, l] of this.levels.entries()) {
      const max = l.max + 1;
      if (p - max >= 0) {
        level = l;
        p = i < this.levels.length - 1 ? p - max : p;

        continue;
      }

      level = l;
      break;
    }

    return [level, p];
  }

  get isIndicatorsValid(): boolean {
    return this.indicators?.split(',').length === 2;
  }

  showPrestige(prestige: number): string {
    const [l, p] = this.getPrestigeLevel(prestige);

    let sp: string = p.toString();
    if (l && this.indicators && this.isIndicatorsValid) {
      const indicators = this.indicators.split(',');

      sp = range(1, l.max + 1)
        .map((i) => (i <= p ? indicators[0] : indicators[1]))
        .join('');
    }

    return `${l?.name ? l.name : '无'}${p > 0 ? `(${sp})` : ''}`;
  }

  getPrestige(f: PrestigeFaction, c: DMCharacter): number {
    const id = `${f.id}:${c.id}`;

    return this.prestiges.get(id) || 0;
  }

  increasePresitge(f: PrestigeFaction, c: DMCharacter): void {
    const id = `${f.id}:${c.id}`;

    this.prestiges.set(id, this.getPrestige(f, c) + 1);
  }
  decreasePresitge(f: PrestigeFaction, c: DMCharacter): void {
    const id = `${f.id}:${c.id}`;

    this.prestiges.set(id, Math.max(this.getPrestige(f, c) - 1, 0));
  }

  static stringify(p: Prestige): string {
    return JSON.stringify(pick(p, ['id', 'name', 'indicators', 'levels', 'factions', 'prestiges']));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static parse(s: string | any): Prestige {
    const json = typeof s === 'string' ? JSON.parse(s) : s;

    const p = new Prestige(json.name, json.id, json.indicators);

    p.levels.replace(json.levels);
    p.factions.replace(json.factions);

    p.prestiges = new Map(json.prestiges);

    return p;
  }
}
