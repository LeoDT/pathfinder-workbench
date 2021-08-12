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
  Portal,
  useDisclosure,
} from '@chakra-ui/react';

import { useStore } from '../../store';
import { CreateCharacterStore } from '../../store/createCharacter';
import { Entity, SpecialFeat } from '../../types/core';
import { EffectNeedInput, EffectType } from '../../types/effectType';
import { ArcaneSchoolPicker } from '../ArcaneSchoolPicker';
import { BloodlinePicker } from '../BloodlinePicker';
import { CollectionEntityPicker } from '../CollectionEntityPicker';
import { DomainPicker } from '../DomainPicker';
import { EffectInputDisplayer } from '../EffectInputDisplayer';
import { EntityPicker, EntityPickerInputRefContext } from '../EntityPicker';
import { SimpleEntityWithChild } from '../SimpleEntity';
import { SubsSelector } from '../SubsSelector';
import { WeaponProficiencyPicker } from '../WeaponProficiencyPicker';

interface Props {
  entity: Entity;
  effect: EffectNeedInput;
  createOrUpgrade: CreateCharacterStore;

  value: any;
  onChange: (v: any) => void;

  onClose: () => void;
}

export function EffectInput({
  entity,
  createOrUpgrade,
  value,
  onChange,
  effect,
  onClose,
}: Props): JSX.Element | null {
  const { collections } = useStore();

  switch (effect.type) {
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

    case EffectType.gainSchoolSpellDC: {
      return (
        <EntityPicker
          items={value ? [value.school] : []}
          onPick={(school) =>
            onChange({
              school: school,
            })
          }
          entities={collections.arcaneSchool.data.filter(
            (s) => s.type === 'standard' && !s.noConflict
          )}
          listAll
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
          type={createOrUpgrade.upgrade.classId === 'Sorcerer' ? 'Sorcerer' : 'Sorcerer'} // TODO
        />
      );
    }

    case EffectType.gainDomain: {
      return <DomainPicker value={value} onChange={onChange} {...effect.args} />;
    }

    case EffectType.selectFromSubs: {
      return (
        <SubsSelector
          parseFormulaBoolean={(s: string) => createOrUpgrade.character.parseFormulaBoolean(s)}
          hasSubs={(s: string[]) => createOrUpgrade.character.hasFeatSubs(entity as SpecialFeat, s)}
          value={value}
          onChange={onChange}
          feat={entity as SpecialFeat}
        />
      );
    }

    case EffectType.gainCombatStyle: {
      return (
        <CollectionEntityPicker
          collection={collections.rangerCombatStyles}
          items={value ? [value] : []}
          onPick={(i) => onChange(i)}
          listAll
        />
      );
    }

    case EffectType.gainFighterWeaponTraining: {
      return (
        <CollectionEntityPicker
          collection={collections.fighterWeaponTrainingGroup}
          items={value ? [value] : []}
          onPick={(i) => onChange(i)}
          listAll
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
              <Portal>
                <PopoverContent w="auto" minW="xs">
                  <PopoverBody maxH="50vh" w="" overflowY="auto">
                    {isOpen ? <EffectInput onClose={onClose} entity={entity} {...props} /> : null}
                  </PopoverBody>
                </PopoverContent>
              </Portal>
            </Popover>
          }
          child={<EffectInputDisplayer source={entity} input={props.value} effect={props.effect} />}
        />
      </Box>
    </EntityPickerInputRefContext.Provider>
  );
}
