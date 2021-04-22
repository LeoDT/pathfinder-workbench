/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef } from 'react';
import { FaCog } from 'react-icons/fa';

import {
  Box,
  Icon,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from '@chakra-ui/react';

import CreateCharacterStore from '../../store/createCharacter';
import { Entity } from '../../types/core';
import { EffectNeadInput, EffectType } from '../../types/effectType';
import { EffectInputDisplayer } from '../EffectInputDisplayer';
import { EntityPickerInputRefContext } from '../EntityPicker';
import { SimpleEntityWithChild } from '../SimpleEntity';
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
      return (
        <WeaponProficiencyPicker
          value={value}
          onChange={onChange}
          training={effect.args.training.filter(
            (t) => !createOrUpgrade.character.proficiency.all.weaponTraining.includes(t)
          )}
          had={createOrUpgrade.character.proficiency.all.weapon}
        />
      );
    }

    default:
      return null;
  }
}

interface PropsWithEntity extends Props {
  entity: Entity;
}

export function SimpleEntityWithEffectInput({ entity, ...props }: PropsWithEntity): JSX.Element {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const initialFocusRef = useRef<HTMLInputElement>(null);

  return (
    <EntityPickerInputRefContext.Provider value={initialFocusRef}>
      <Box>
        <SimpleEntityWithChild
          entity={entity}
          addon={
            <Popover
              isOpen={isOpen}
              isLazy
              onClose={onClose}
              closeOnBlur
              initialFocusRef={initialFocusRef}
            >
              <PopoverTrigger>
                <IconButton
                  aria-label="configure feat"
                  icon={<Icon as={FaCog} />}
                  height="auto"
                  size="sm"
                  colorScheme="teal"
                  borderLeftRadius="0"
                  onClick={onToggle}
                />
              </PopoverTrigger>
              <PopoverContent>
                <PopoverBody>
                  <EffectInput {...props} />
                </PopoverBody>
              </PopoverContent>
            </Popover>
          }
          child={<EffectInputDisplayer input={props.value} effect={props.effect} />}
        />
      </Box>
    </EntityPickerInputRefContext.Provider>
  );
}
