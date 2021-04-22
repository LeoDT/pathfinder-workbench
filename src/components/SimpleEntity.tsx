import { HStack, Heading, Spacer, StackProps, Box } from '@chakra-ui/react';
import { ReactNode } from 'react';

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
  addon?: ReactNode;
}

export default function SimpleEntity({
  entity,
  showId = false,
  quickViewer = true,
  addon,
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
      spacing="0"
      minW="36"
      border="1px"
      borderColor="gray.200"
      borderRadius="md"
      _hover={{
        borderColor: 'gray.300',
      }}
      alignItems="stretch"
      {...props}
    >
      <HStack p="2" w="100%">
        {child}
        <Spacer />
        {quickViewer ? <EntityQuickViewerToggler entity={entity} /> : null}
      </HStack>
      {addon}
    </HStack>
  );
}

interface PropsWithChild extends Props {
  child: ReactNode;
}

export function SimpleEntityWithChild({ child, ...props }: PropsWithChild): JSX.Element {
  const entity = <SimpleEntity {...props} />;

  return child ? (
    <Box>
      {entity}
      <Box pl="4" pt="2">
        {child}
      </Box>
    </Box>
  ) : (
    entity
  );
}
