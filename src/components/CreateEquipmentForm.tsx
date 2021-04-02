import { Input, Switch, Text } from '@chakra-ui/react';

import { ArmorType, Equipment, RaceSize, WeaponType } from '../types/core';

import {
  armorCostWeight,
  enchantmentOptions,
  makeArmor,
  makeWeapon,
  weaponCostWeight,
} from '../utils/equipment';
import { showWeight } from '../utils/misc';
import { showCoin } from '../utils/coin';

import Select from './Select';
import { Form, FormControl } from './Form';
import { useEffect, useMemo, useState } from 'react';

interface Props {
  proto: WeaponType | ArmorType;
  size: RaceSize;
  onCreate: (e: Equipment) => void;
}

export default function CreateEquipmentForm({ proto, size, onCreate }: Props): JSX.Element {
  const [name, setName] = useState(proto.name);
  const [masterwork, setMasterwork] = useState(false);
  const [enchantment, setEnchantment] = useState(0);
  const [spiked, setSpiked] = useState(false);
  const { weight, cost } = useMemo(() => {
    switch (proto._type) {
      case 'armorType':
        return armorCostWeight(proto, size, masterwork, enchantment, spiked);

      case 'weaponType':
        return weaponCostWeight(proto, size, masterwork, enchantment);
    }
  }, [proto, size, spiked, masterwork, enchantment]);

  const equipment = useMemo(() => {
    switch (proto._type) {
      case 'armorType':
        return makeArmor(proto, name, size, masterwork, enchantment, spiked);

      case 'weaponType':
        return makeWeapon(proto, name, size, masterwork, enchantment);

      default:
        break;
    }
  }, [proto, size, spiked, masterwork, enchantment]);

  useEffect(() => {
    if (equipment) {
      onCreate(equipment);
    }
  }, [equipment]);

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
      <FormControl label="重量" opacity={0.6} cursor="not-allowed">
        <Text>{showWeight(weight)}</Text>
      </FormControl>
      <FormControl label="花费" opacity={0.6} cursor="not-allowed">
        <Text>{showCoin(cost)}</Text>
      </FormControl>
    </Form>
  );
}
