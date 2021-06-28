import { ReactNode } from 'react';
import { FaInfoCircle } from 'react-icons/fa';

import {
  Badge,
  BadgeProps,
  Box,
  HStack,
  Heading,
  Icon,
  Spacer,
  StackProps,
} from '@chakra-ui/react';

import { ENTITY_COLORS } from '../constant';
import { useStore } from '../store';
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

interface BaseProps {
  entity: Entity;
  showId?: boolean;
  quickViewer?: boolean;
}

interface Props extends BaseProps, StackProps {
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

    case 'class':
    case 'archetype':
      child = (
        <Heading as="h4" fontSize="lg" color={ENTITY_COLORS.class}>
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

interface PropsForBadge extends BaseProps, BadgeProps {}

export function SimpleEntityBadge({
  entity,
  showId = false,
  quickViewer = false,
  ...badgeProps
}: PropsForBadge): JSX.Element {
  const { ui } = useStore();
  const props: BadgeProps = quickViewer
    ? {
        cursor: 'pointer',
        _hover: {
          opacity: 0.8,
        },
        onClick: () => {
          ui.showQuickViewer(entity);
        },
      }
    : {};

  return (
    <Badge fontSize="md" verticalAlign="top" colorScheme="blue" {...badgeProps} {...props}>
      {entity.name}
      {showId ? <small style={{ fontWeight: 'normal' }}>({entity.id})</small> : null}
      {quickViewer ? <Icon as={FaInfoCircle} verticalAlign="-2px" ml="2px" /> : null}
    </Badge>
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
