import { useMemo } from 'react';

import { Badge, Box, HStack, Heading, Text } from '@chakra-ui/react';

import { ENTITY_COLORS, ENTITY_COLOR_SCHEME } from '../constant';
import { useStore } from '../store';
import { Archetype as ArchetypeType } from '../types/core';

interface Props {
  archetype: ArchetypeType;
}

export function Archetype({ archetype }: Props): JSX.Element {
  const { collections } = useStore();
  const clas = useMemo(() => collections.class.getById(archetype.class), [archetype]);

  return (
    <Box>
      <HStack>
        <Badge>{archetype.book}</Badge>
        <Badge colorScheme={ENTITY_COLOR_SCHEME.class}>{clas.name}</Badge>
        <Heading as="h4" fontSize="lg" color={ENTITY_COLORS.archetype}>
          {archetype.name} {<small style={{ fontWeight: 'normal' }}>({archetype.id})</small>}
        </Heading>
      </HStack>

      {archetype.desc ? <Text my="2">{archetype.desc}</Text> : null}

      <Box>
        {archetype.feats.map((p) => (
          <Box key={p.id} p="2" border="1px" borderColor="gray.200" mb="2" borderRadius="md">
            <Heading as="h5" color={ENTITY_COLORS.classFeat} fontSize="lg" mb="2">
              {p.name} <small>({p.id})</small>
            </Heading>
            <Text dangerouslySetInnerHTML={{ __html: p.desc }} whiteSpace="pre-wrap" />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
