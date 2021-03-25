import { Heading, HStack, Spacer } from '@chakra-ui/react';

import { Entity, Spell as SpellType, Feat as FeatType } from '../types/core';
import { CollectionEntityType } from '../store/collection';

import { EntityQuickViewerToggler } from './EntityQuickViewer';

import Spell from './Spell';
import Feat from './Feat';

interface Props {
  entity: Entity;
  entityType: CollectionEntityType;
  quickViewer?: boolean;
}

export default function SimpleEntity({
  entity,
  entityType,
  quickViewer = true,
}: Props): JSX.Element {
  let child;

  switch (entityType) {
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
      {quickViewer ? <EntityQuickViewerToggler entity={entity} kind={entityType} /> : null}
    </HStack>
  );
}
