import { pick, omit } from 'lodash-es';
import { makeObservable, action, observable, IObservableArray, computed } from 'mobx';

import { Armor, Equipment, Weapon } from '../../types/core';
import { SelectOptions } from '../../types/misc';
import { Coin } from '../../utils/coin';
import { equipmentCostWeight, showEquipment } from '../../utils/equipment';

import Character from '.';
import { collections } from '../collection';

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

      isHoldingTwoHandWeapon: computed,
      isHoldingTwoHand: computed,
      isTwoWeapon: computed,

      bucklerId: observable,
      buckler: computed,

      armorId: observable,
      armor: computed,

      armorClassModifier: computed,

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
        text: showEquipment(e),
        value: e,
      }));
  }
  get bucklerOptions(): SelectOptions<Armor> {
    return this.storage
      .filter((e): e is Armor =>
        Boolean(e.equipmentType === 'armor' && e.type._type === 'armorType' && e.type.meta.buckler)
      )
      .map((e) => ({
        text: showEquipment(e),
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
        text: showEquipment(e),
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

  get armorClassModifier(): number {
    let mod = 0;

    if (this.armor) {
      mod += this.armor.type.meta.ac;
    }

    if (this.offHand?.type.meta.category === 'shield') {
      mod += this.offHand?.type.meta.ac;
    }

    if (this.buckler) {
      mod += this.buckler?.type.meta.ac;
    }

    return mod;
  }

  get isHoldingTwoHandWeapon(): boolean {
    return Boolean(
      this.mainHand &&
        (this.mainHand.type.meta.category === 'two-handed' || this.mainHand.type.meta.bothHand)
    );
  }
  get isHoldingTwoHand(): boolean {
    return Boolean(this.mainHand && this.offHand && this.mainHand === this.offHand);
  }
  get isTwoWeapon(): boolean {
    return Boolean(
      this.mainHand !== this.offHand && this.mainHand && this.offHand?.equipmentType === 'weapon'
    );
  }
  get isOffHandHoldingShield(): boolean {
    return Boolean(this.offHand && this.offHand.type.meta.category === 'shield');
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
          if (this.isHoldingTwoHand) {
            this.offHandId = undefined;
          }

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

  wear(a: Armor, part: BodyPart = 'armor'): void {
    switch (part) {
      case 'armor':
        this.armorId = a.id;
        break;
    }
  }

  unwear(part: BodyPart = 'armor'): void {
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
        ...pick(e, ['equipmentType', 'id', 'size', 'name', 'masterwork', 'enchantment', 'spiked']),
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
