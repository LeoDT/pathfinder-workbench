import { pick, omit } from 'lodash-es';
import { makeObservable, action, observable, IObservableArray, computed } from 'mobx';

import { Armor, Equipment, Weapon } from '../types/core';
import { SelectOptions } from '../types/misc';
import { Coin } from '../utils/coin';
import { equipmentCostWeight } from '../utils/equipment';

import Character from './character';
import { collections } from './collection';

export type Hand = 'main' | 'off';
export type BodyPart = 'armor' | 'head';

interface RawCharacterEquip {
  storage?: Array<Equipment>;
  mainHandId?: string;
  offHandId?: string;
  bucklerId?: string;
  armorId?: string;
}

export default class CharacterEquip {
  character: Character;

  storage: IObservableArray<Equipment>;

  mainHandId?: string;
  offHandId?: string;
  bucklerId?: string;
  armorId?: string;

  constructor(c: Character, raw?: RawCharacterEquip) {
    makeObservable(this, {
      storageWithCostWeight: computed,
      handOptions: computed,
      bucklerOptions: computed,
      armorOptions: computed,

      mainHandId: observable,
      mainHand: computed,

      offHandId: observable,
      offHand: computed,

      bucklerId: observable,
      buckler: computed,

      armorId: observable,
      armor: computed,

      hold: action,
      unhold: action,
      unholdBuckler: action,
      wear: action,
      unwear: action,
    });

    this.character = c;
    this.storage = observable.array(raw?.storage || [], { deep: false });

    this.mainHandId = raw?.mainHandId;
    this.offHandId = raw?.offHandId;
    this.bucklerId = raw?.bucklerId;
    this.armorId = raw?.armorId;
  }

  get storageWithCostWeight(): Array<{ e: Equipment; cost: Coin; weight: number }> {
    return this.storage.map((e) => ({ e, ...equipmentCostWeight(e) }));
  }

  get handOptions(): SelectOptions<Weapon | Armor> {
    return this.storage
      .filter(
        (e) =>
          e.equipmentType === 'weapon' ||
          (e.type._type === 'armorType' &&
            e.type.meta.category === 'shield' &&
            !e.type.meta.buckler)
      )
      .map((e) => ({
        text: e.name,
        value: e,
      }));
  }
  get bucklerOptions(): SelectOptions<Armor> {
    return this.storage
      .filter((e): e is Armor =>
        Boolean(e.equipmentType === 'armor' && e.type._type === 'armorType' && e.type.meta.buckler)
      )
      .map((e) => ({
        text: e.name,
        value: e,
      }));
  }
  get armorOptions(): SelectOptions<Armor> {
    return this.storage
      .filter((e): e is Armor =>
        Boolean(
          e.equipmentType === 'armor' &&
            e.type._type === 'armorType' &&
            e.type.meta.category !== 'shield'
        )
      )
      .map((e) => ({
        text: e.name,
        value: e,
      }));
  }

  getStorageById(id: string): Equipment | undefined {
    return this.storage.find((e) => e.id === id);
  }

  get mainHand(): Weapon | undefined {
    return this.storage.find(
      (e): e is Weapon => e.id === this.mainHandId && e.equipmentType === 'weapon'
    );
  }
  get offHand(): Weapon | Armor | undefined {
    return this.storage.find((e): e is Weapon | Armor => e.id === this.offHandId);
  }
  get buckler(): Armor | undefined {
    return this.storage.find((e): e is Armor => e.id === this.bucklerId);
  }
  get armor(): Armor | undefined {
    return this.storage.find((e): e is Armor => e.id === this.armorId);
  }

  get mainHandAttack(): number {
    let modifier = 0;
    switch (this.mainHand?.type.meta.category) {
      case 'light':
      case 'one-handed':
      case 'two-handed':
        modifier = this.character.abilityModifier.str;
        break;

      case 'ranged':
        modifier = this.character.abilityModifier.dex;
    }

    return this.character.status.maxBab + modifier;
  }

  get mainHandDamageModifier(): number {
    let modifier = 0;
    switch (this.mainHand?.type.meta.category) {
      case 'light':
      case 'one-handed':
        modifier = this.character.abilityModifier.str;
        break;
      case 'two-handed':
        modifier = Math.floor(this.character.abilityModifier.str * 1.5);
    }

    return modifier;
  }

  get isTwoWeapon(): boolean {
    return Boolean(
      this.mainHand !== this.offHand && this.mainHand && this.offHand?.equipmentType === 'weapon'
    );
  }

  hold(e: Equipment, hand?: Hand): void {
    switch (e.equipmentType) {
      case 'weapon': {
        if (e.equipmentType === 'weapon' && e.type.meta.bothHand) {
          this.mainHandId = e.id;
          this.offHandId = e.id;

          break;
        }

        if (hand === 'main') {
          this.mainHandId = e.id;
        }

        if (hand === 'off') {
          this.offHandId = e.id;
        }

        break;
      }

      case 'armor': {
        if (e.type.meta.category !== 'shield') {
          throw new Error('can not hold armor');
        }

        if (e.type.meta.buckler) {
          this.bucklerId = e.id;
        } else {
          this.offHandId = e.id;
        }

        break;
      }
    }
  }

  unhold(hand: Hand): void {
    if (this.mainHand && this.mainHand.type.meta.bothHand) {
      this.mainHandId = undefined;
      this.offHandId = undefined;

      return;
    }

    switch (hand) {
      case 'main':
        this.mainHandId = undefined;
        break;
      case 'off':
        this.offHandId = undefined;
        break;
    }
  }

  unholdBuckler(): void {
    this.bucklerId = undefined;
  }

  wear(a: Armor, part?: BodyPart): void {
    switch (part) {
      case 'armor':
        this.armorId = a.id;
        break;
    }
  }

  unwear(part?: BodyPart): void {
    switch (part) {
      case 'armor':
        this.armorId = undefined;
        break;
    }
  }

  static stringify(e: CharacterEquip): string {
    return JSON.stringify({
      mainHandId: e.mainHandId,
      offHandId: e.offHandId,
      bucklerId: e.bucklerId,
      armorId: e.armorId,
      storage: e.storage.map((e) => ({
        ...pick(e, ['equipmentType', 'id', 'name', 'masterwork', 'enchantment', 'spiked']),
        typeId: e.type.id,
      })),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static parse(s: string | any, c: Character): CharacterEquip {
    const json = typeof s === 'string' ? JSON.parse(s) : s;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storage = json.storage?.map((e: any) => {
      let type = null;

      switch (e.equipmentType) {
        case 'weapon':
          type = collections.weaponType.getById(e.typeId);
          break;
        case 'armor':
          type = collections.armorType.getById(e.typeId);
          break;
      }

      return {
        ...omit(e, ['typeId']),
        _type: 'common',
        type,
      };
    });

    return new CharacterEquip(c, {
      ...json,
      storage,
    });
  }
}
