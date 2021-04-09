import { makeObservable, computed } from 'mobx';
import { Abilities } from '../types/core';

import Character from './character';

export default class CharacterStatus {
  character: Character;

  constructor(c: Character) {
    makeObservable(this, {
      hp: computed,
      initiative: computed,
      fortitude: computed,
      reflex: computed,
      will: computed,
      bab: computed,
      cmb: computed,
      cmd: computed,
      ac: computed,
      flatFooted: computed,
      touch: computed,
    });

    this.character = c;
  }

  get modifier(): Abilities {
    return this.character.abilityModifier;
  }

  get hp(): number {
    let base = 0;

    this.character.levelDetail.forEach((level, clas) => {
      base += clas.hd + (clas.hd / 2 + 1) * (level - 1);
    });

    base += this.character.level * this.modifier.con;

    return base;
  }
  get initiative(): number {
    return this.modifier.dex;
  }

  get fortitude(): number {
    let base = 0;

    this.character.classLevelDetail.forEach((cl) => {
      base += cl.fortitude;
    });

    base += this.modifier.con;

    return base;
  }
  get reflex(): number {
    let base = 0;

    this.character.classLevelDetail.forEach((cl) => {
      base += cl.reflex;
    });

    base += this.modifier.dex;

    return base;
  }
  get will(): number {
    let base = 0;

    this.character.classLevelDetail.forEach((cl) => {
      base += cl.will;
    });

    base += this.modifier.wis;

    return base;
  }

  get bab(): number[] {
    const base: number[] = [];

    this.character.classLevelDetail.forEach((cl) => {
      cl.bab.forEach((v, i) => {
        if (typeof base[i] === 'undefined') {
          base[i] = 0;
        }

        base[i] += v;
      });
    });

    return base;
  }
  get maxBab(): number {
    return Math.max(...this.bab);
  }

  get cmb(): number {
    return this.maxBab + this.modifier.str;
  }
  get cmd(): number {
    return 10 + this.maxBab + this.modifier.str + this.modifier.con;
  }
  get ac(): number {
    return [10, this.modifier.dex, this.character.equipment.armorClassModifier].reduce(
      (acc, i) => acc + i,
      0
    );
  }
  get flatFooted(): number {
    return this.ac - this.modifier.dex;
  }
  get touch(): number {
    return this.ac - this.character.equipment.armorClassModifier;
  }
}
