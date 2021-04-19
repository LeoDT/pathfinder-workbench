/* eslint-disable @typescript-eslint/no-explicit-any */

import { SimpleGrid } from '@chakra-ui/react';

import { collections } from '../../store/collection';
import CreateCharacterStore from '../../store/createCharacter';
import { EffectNeadInput, EffectType } from '../../types/effectType';
import SimpleEntity from '../SimpleEntity';
import WeaponProficiencyPicker from '../WeaponProficiencyPicker';

interface Props {
  effect: EffectNeadInput;
  createOrUpgrade: CreateCharacterStore;

  value: any;
  onChange: (v: any) => void;
}

export function EffectInput({
  createOrUpgrade,
  value,
  onChange,
  effect,
}: Props): JSX.Element | null {
  switch (effect.type) {
    case EffectType.gainSelectedWeaponProficiency: {
      const selected = value ? collections.weaponType.getById(value) : null;

      return (
        <>
          <WeaponProficiencyPicker
            value={value}
            onChange={onChange}
            training={effect.args.training.filter(
              (t) => !createOrUpgrade.character.proficiency.all.weaponTraining.includes(t)
            )}
            had={createOrUpgrade.character.proficiency.all.weapon}
          />
          {selected ? (
            <SimpleGrid columns={[1, 3]} spacing="2" my="2">
              <SimpleEntity entity={selected} />
            </SimpleGrid>
          ) : null}
        </>
      );
    }

    default:
      return null;
  }
}
