import { Heading, HStack, Spacer } from '@chakra-ui/react';

import {
  Entity,
  Spell as SpellType,
  Feat as FeatType,
  WeaponType as WeaponTypeType,
  ArmorType as ArmorTypeType,
} from '../types/core';

import { EntityQuickViewerToggler } from './EntityQuickViewer';

import Spell from './Spell';
import Feat from './Feat';
import WeaponType from './WeaponType';
import ArmorType from './ArmorType';

interface Props {
  entity: Entity;
  quickViewer?: boolean;
}

export default function SimpleEntity({ entity, quickViewer = true }: Props): JSX.Element {
  let child;

  switch (entity._type) {
    case 'spell': {
      child = <Spell spell={entity as SpellType} showDescription={false} showMeta={false} />;
      break;
    }

    case 'feat': {
      child = (
        <Feat
          feat={entity as FeatType}
          showBrief={false}
          showMeta={false}
          showDescription={false}
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
        />
      );
      break;

    case 'armorType':
      child = (
        <ArmorType armorType={entity as ArmorTypeType} showMeta={false} showDescription={false} />
      );
      break;

    default:
      child = (
        <Heading as="h4" fontSize="lg">
          {entity.name}({entity.id})
        </Heading>
      );
  }

  return (
    <HStack
      border="1px"
      borderColor="gray.200"
      p="2"
      borderRadius="md"
      minW="64"
      _hover={{
        borderColor: 'gray.300',
      }}
    >
      {child}
      <Spacer />
      {quickViewer ? <EntityQuickViewerToggler entity={entity} /> : null}
    </HStack>
  );
}
