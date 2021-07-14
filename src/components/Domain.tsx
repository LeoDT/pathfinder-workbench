import { Badge, Box, HStack, Heading, SimpleGrid, Text } from '@chakra-ui/react';

import { ENTITY_COLORS } from '../constant';
import { useStore } from '../store';
import { Domain as DomainType } from '../types/domain';
import { SimpleEntity } from './SimpleEntity';

interface Props {
  domain: DomainType;
}

export function Domain({ domain }: Props): JSX.Element {
  const { collections } = useStore();

  return (
    <Box>
      <HStack>
        <Badge>{domain.inquisition ? '裁决域' : '领域'}</Badge>
        <Heading as="h4" fontSize="lg" color={ENTITY_COLORS.domain}>
          {domain.name} {<small style={{ fontWeight: 'normal' }}>({domain.id})</small>}
        </Heading>
      </HStack>

      {domain.desc ? <Text my="2">{domain.desc}</Text> : null}

      <Box>
        {domain.powers.map((p) => (
          <Box key={p.id} p="2" border="1px" borderColor="gray.200" mb="2" borderRadius="md">
            <Heading as="h5" color={ENTITY_COLORS.classFeat} fontSize="lg" mb="2">
              {p.name} <small>({p.id})</small>
            </Heading>
            <Text dangerouslySetInnerHTML={{ __html: p.desc }} whiteSpace="pre-wrap" />
          </Box>
        ))}
      </Box>

      {domain.spells ? (
        <SimpleGrid columns={[1, 2]} spacing="2">
          {domain.spells?.map((s) => {
            const spell = collections.spell.getById(s);

            return <SimpleEntity entity={spell} key={spell.id} />;
          })}
        </SimpleGrid>
      ) : null}

      {domain.subDomains
        ? domain.subDomains.map((d) => (
            <Box key={d.id}>
              <HStack my="2">
                <Badge>子域</Badge>
                <Heading as="h4" fontSize="lg" color={ENTITY_COLORS.domain}>
                  {d.name} {<small style={{ fontWeight: 'normal' }}>({d.id})</small>}
                </Heading>
              </HStack>

              {d.desc ? <Text my="2">{d.desc}</Text> : null}

              {d.powers.map((p) => (
                <Box key={p.id} p="2" border="1px" borderColor="gray.200" mb="2" borderRadius="md">
                  <Heading as="h5" color={ENTITY_COLORS.classFeat} fontSize="lg" mb="2">
                    {p.name} <small>({p.id})</small>
                  </Heading>
                  <Text dangerouslySetInnerHTML={{ __html: p.desc }} whiteSpace="pre-wrap" />
                </Box>
              ))}

              {d.spells ? (
                <SimpleGrid columns={[1, 2]} spacing="2">
                  {d.spells?.map((s) => {
                    const spell = collections.spell.getById(s);

                    return <SimpleEntity entity={spell} key={spell.id} />;
                  })}
                </SimpleGrid>
              ) : null}
            </Box>
          ))
        : null}
    </Box>
  );
}
