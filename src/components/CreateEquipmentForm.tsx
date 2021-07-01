import { useEffect, useMemo, useState } from 'react';

import { Input, Switch, Text } from '@chakra-ui/react';

import {
  ArmorType,
  Equipment,
  MagicItemType,
  RaceSize,
  Spell,
  SpellItemType,
  WeaponType,
} from '../types/core';
import { showCoin } from '../utils/coin';
import {
  armorCostWeight,
  enchantmentOptions,
  getSpellItemDefaultName,
  magicItemCostWeight,
  makeArmor,
  makeMagicItem,
  makeSpellItem,
  makeWeapon,
  spellItemCostWeight,
  spellItemTypeTranslates,
  weaponCostWeight,
} from '../utils/equipment';
import { showWeight } from '../utils/misc';
import { ButtonSwitch } from './ButtonSwitch';
import { Form, FormControl } from './Form';
import { Select } from './Select';

interface Props {
  proto: WeaponType | ArmorType | MagicItemType | Spell;
  size: RaceSize;
  onCreate: (e: Equipment) => void;
}

const SPELL_ITEM_TYPE_OPTIONS: Array<{ text: string; value: SpellItemType }> = Array.from(
  Object.entries(spellItemTypeTranslates)
).map(([k, v]) => ({
  text: v,
  value: k as SpellItemType,
}));

export function CreateEquipmentForm({ proto, size, onCreate }: Props): JSX.Element {
  const [masterwork, setMasterwork] = useState(false);
  const [enchantment, setEnchantment] = useState(0);
  const [spiked, setSpiked] = useState(false);
  const [spellItemType, setSpellItemType] = useState<SpellItemType>('scroll');
  const [name, setName] = useState(() => {
    if (proto._type === 'spell') {
      return getSpellItemDefaultName(proto, spellItemType);
    }

    return proto.name;
  });
  const { weight, cost } = useMemo(() => {
    switch (proto._type) {
      case 'armorType':
        return armorCostWeight(proto, size, masterwork, enchantment, spiked);

      case 'weaponType':
        return weaponCostWeight(proto, size, masterwork, enchantment);

      case 'magicItemType':
        return magicItemCostWeight(proto);

      case 'spell':
        return spellItemCostWeight(proto, spellItemType);
    }
  }, [proto, size, spiked, masterwork, enchantment, spellItemType]);

  const equipment = useMemo(() => {
    switch (proto._type) {
      case 'armorType':
        return makeArmor(proto, name, size, masterwork, enchantment, spiked);

      case 'weaponType':
        return makeWeapon(proto, name, size, masterwork, enchantment);

      case 'magicItemType':
        return makeMagicItem(proto, name);

      case 'spell':
        return makeSpellItem(proto, spellItemType, name);

      default:
        break;
    }
  }, [proto, size, spiked, masterwork, enchantment, spellItemType, name]);

  useEffect(() => {
    if (equipment) {
      onCreate(equipment);
    }
  }, [equipment]);

  useEffect(() => {
    if (proto._type === 'spell') {
      setName(getSpellItemDefaultName(proto, spellItemType));
    }
  }, [proto, spellItemType]);

  return (
    <Form>
      <FormControl label="名称">
        <Input
          variant="unstyled"
          textAlign="right"
          placeholder={proto.name}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>
      {proto._type === 'weaponType' || proto._type === 'armorType' ? (
        <>
          <FormControl label="精制品">
            <Switch
              colorScheme="teal"
              size="lg"
              isChecked={masterwork || enchantment > 0}
              isDisabled={enchantment > 0}
              onChange={(e) => setMasterwork(e.target.checked)}
            />
          </FormControl>
          <FormControl label="强化">
            <Select
              options={enchantmentOptions}
              value={enchantment}
              onChange={(v) => {
                setEnchantment(v);
              }}
            />
          </FormControl>
          {proto._type === 'armorType' ? (
            <FormControl label="甲/盾刺">
              <Switch
                colorScheme="teal"
                size="lg"
                isChecked={spiked}
                onChange={(e) => setSpiked(e.target.checked)}
              />
            </FormControl>
          ) : null}
        </>
      ) : null}
      {proto._type === 'spell' ? (
        <>
          <FormControl label="类型">
            <ButtonSwitch
              value={spellItemType}
              options={SPELL_ITEM_TYPE_OPTIONS}
              onChange={(v) => setSpellItemType(v)}
            />
          </FormControl>
        </>
      ) : null}
      <FormControl label="重量" opacity={0.6} cursor="not-allowed">
        <Text>{showWeight(weight)}</Text>
      </FormControl>
      <FormControl label="花费" opacity={0.6} cursor="not-allowed">
        <Text>{showCoin(cost)}</Text>
      </FormControl>
    </Form>
  );
}
