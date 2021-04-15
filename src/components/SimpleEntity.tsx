import React from 'react';

import { HStack, Heading, Spacer, StackProps } from '@chakra-ui/react';

import { ENTITY_COLORS } from '../constant';
import {
  ArmorType as ArmorTypeType,
  Entity,
  Feat as FeatType,
  Spell as SpellType,
  WeaponType as WeaponTypeType,
} from '../types/core';
import ArmorType from './ArmorType';
import { EntityQuickViewerToggler } from './EntityQuickViewer';
import Feat from './Feat';
import Spell from './Spell';
import WeaponType from './WeaponType';

interface Props extends StackProps {
  entity: Entity;
  showId?: boolean;
  quickViewer?: boolean;
}

export default function SimpleEntity({
  entity,
  showId = false,
  quickViewer = true,
  ...props
}: Props): JSX.Element {
  let child;

  switch (entity._type) {
    case 'spell': {
      child = (
        <Spell
          spell={entity as SpellType}
          showDescription={false}
          showMeta={false}
          showId={showId}
        />
      );
      break;
    }

    case 'feat': {
      child = (
        <Feat
          feat={entity as FeatType}
          showBrief={false}
          showMeta={false}
          showDescription={false}
          showId={showId}
        />
      );
      break;
    }

    case 'weaponType':
      child = (
        <WeaponType
          weaponType={entity as WeaponTypeType}
          showMeta={false}
          showDescription={false}
          showId={showId}
        />
      );
      break;

    case 'armorType':
      child = (
        <ArmorType
          armorType={entity as ArmorTypeType}
          showMeta={false}
          showDescription={false}
          showId={showId}
        />
      );
      break;

    case 'classFeat':
    case 'racialTrait':
      child = (
        <Heading
          as="h4"
          fontSize="lg"
          color={ENTITY_COLORS.feat}
          textDecoration={entity.deprecated ? 'solid line-through 2px red' : ''}
        >
          {entity.name}{' '}
          {showId ? <small style={{ fontWeight: 'normal' }}>({entity.id})</small> : null}
        </Heading>
      );
      break;

    default:
      child = (
        <Heading as="h4" fontSize="lg">
          {entity.name}{' '}
          {showId ? <small style={{ fontWeight: 'normal' }}>({entity.id})</small> : null}
        </Heading>
      );
  }

  return (
    <HStack
      border="1px"
      borderColor="gray.200"
      p="2"
      borderRadius="md"
      minW="36"
      _hover={{
        borderColor: 'gray.300',
      }}
      {...props}
    >
      {child}
      <Spacer />
      {quickViewer ? <EntityQuickViewerToggler entity={entity} /> : null}
    </HStack>
  );
}
