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
import { EffectNeedInput, EffectType } from '../../types/effectType';
import { ArcaneSchoolPicker } from '../ArcaneSchoolPicker';
import { BloodlinePicker } from '../BloodlinePicker';
import { EffectInputDisplayer } from '../EffectInputDisplayer';
import { EntityPickerInputRefContext } from '../EntityPicker';
import { SimpleEntityWithChild } from '../SimpleEntity';
import { WeaponProficiencyPicker } from '../WeaponProficiencyPicker';

interface Props {
  effect: EffectNeedInput;
  createOrUpgrade: CreateCharacterStore;

  value: any;
  onChange: (v: any) => void;

  onClose: () => void;
}

export function EffectInput({
  createOrUpgrade,
  value,
  onChange,
  effect,
  onClose,
}: Props): JSX.Element | null {
  switch (effect.type) {
    case EffectType.gainSkill: {
      if (effect.args.skillId) {
        return null;
      }

      return <div>123</div>;
    }

    case EffectType.gainArcaneSchool: {
      return (
        <ArcaneSchoolPicker
          value={value}
          onChange={(...args) => {
            onChange(...args);
            onClose();
          }}
          standardForbidden={effect.args.standardForbidden}
        />
      );
    }
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

    case EffectType.gainBloodline: {
      return (
        <BloodlinePicker
          value={value}
          onChange={onChange}
          type={createOrUpgrade.upgrade.classId === 'Sorcerer' ? 'Sorcerer' : 'Sorcerer'}
        />
      );
    }

    default:
      return null;
  }
}

interface PropsWithEntity extends Omit<Props, 'onClose'> {
  entity: Entity;
  readonly?: boolean;
}

export function SimpleEntityWithEffectInput({
  entity,
  readonly = false,
  ...props
}: PropsWithEntity): JSX.Element {
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
                  isDisabled={readonly}
                />
              </PopoverTrigger>
              <PopoverContent w="auto" minW="xs">
                <PopoverBody maxH="50vh" w="" overflowY="auto">
                  {isOpen ? <EffectInput onClose={onClose} {...props} /> : null}
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
