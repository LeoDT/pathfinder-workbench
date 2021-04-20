import { makeObservable, computed } from 'mobx';
import { Abilities, Bonus } from '../../types/core';

import { collections } from '../collection';
import Character from '.';
import { aggregateBonusesAmount } from '../../utils/bonus';
import { EffectGainSaveArgs } from '../../types/effectType';

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

    this.character.upgradesWithPending.forEach((u, level) => {
      if (u.hp === 0) {
        const clas = collections.class.getById(u.classId);

        base += level === 0 ? clas.hd : clas.hd / 2 + 1;
      } else {
        base += u.hp;
      }

      if (u.favoredClassBonus === 'hp') {
        base += 1;
      }
    });

    base += this.character.level * this.modifier.con;

    return base;
  }
  get initiative(): number {
    return (
      this.modifier.dex +
      aggregateBonusesAmount(
        this.character.effect.getGainInitiativeEffects().map((es) => es.effect.args.bonus)
      )
    );
  }

  getSaveBonuses(t: EffectGainSaveArgs['saveType']): Bonus[] {
    const args = this.character.effect
      .getGainSaveEffects()
      .map((es) => es.effect.args)
      .filter((a) => a.saveType === t || a.saveType === 'all');

    return args.map((a) => a.bonus);
  }

  get fortitude(): number {
    let base = 0;

    this.character.classLevelDetail.forEach((cl) => {
      base += cl.fortitude;
    });

    base += this.modifier.con;
    base += aggregateBonusesAmount(this.getSaveBonuses('fortitude'));

    return base;
  }
  get reflex(): number {
    let base = 0;

    this.character.classLevelDetail.forEach((cl) => {
      base += cl.reflex;
    });

    base += this.modifier.dex;
    base += aggregateBonusesAmount(this.getSaveBonuses('reflex'));

    return base;
  }
  get will(): number {
    let base = 0;

    this.character.classLevelDetail.forEach((cl) => {
      base += cl.will;
    });

    base += this.modifier.wis;
    base += aggregateBonusesAmount(this.getSaveBonuses('will'));

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

  getBonusesForAC(t: 'ac' | 'flatFooted' | 'touch'): Bonus[] {
    const bonuses = this.character.effect.getGainACEffects().map((es) => es.effect.args.bonus);

    switch (t) {
      case 'flatFooted':
        return bonuses.filter(({ type }) => {
          const bt = collections.bonusType.getById(type);

          return bt.flatFootedAC;
        });
      case 'touch':
        return bonuses.filter(({ type }) => {
          const bt = collections.bonusType.getById(type);

          return bt.touchAC;
        });
    }

    return bonuses;
  }
  get ac(): number {
    const bonus = aggregateBonusesAmount(this.getBonusesForAC('ac'));

    return [10, this.modifier.dex, this.character.equipment.armorClassModifier, bonus].reduce(
      (acc, i) => acc + i,
      0
    );
  }
  get flatFooted(): number {
    const bonus = aggregateBonusesAmount(this.getBonusesForAC('flatFooted'));

    return [10, this.character.equipment.armorClassModifier, bonus].reduce((acc, i) => acc + i, 0);
  }
  get touch(): number {
    const bonus = aggregateBonusesAmount(this.getBonusesForAC('touch'));

    return [10, this.modifier.dex, bonus].reduce((acc, i) => acc + i, 0);
  }
}
