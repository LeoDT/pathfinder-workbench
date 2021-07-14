import { Box, Heading, SimpleGrid, Text } from '@chakra-ui/react';

import { ENTITY_COLORS } from '../constant';
import { useStore } from '../store';
import { Bloodline as BloodlineType } from '../types/bloodline';
import { SimpleEntity } from './SimpleEntity';

interface Props {
  bloodline: BloodlineType;
}

export function Bloodline({ bloodline }: Props): JSX.Element {
  const { collections } = useStore();

  return (
    <Box>
      <Heading as="h4" fontSize="lg" color={ENTITY_COLORS.bloodline}>
        {bloodline.name} {<small style={{ fontWeight: 'normal' }}>({bloodline.id})</small>}
      </Heading>

      {bloodline.desc ? <Text my="2">{bloodline.desc}</Text> : null}

      {bloodline.arcana ? (
        <Box
          key={bloodline.arcana.id}
          p="2"
          border="1px"
          borderColor="gray.200"
          mb="2"
          borderRadius="md"
        >
          <Heading as="h5" color={ENTITY_COLORS.classFeat} fontSize="lg" mb="2">
            {bloodline.arcana.name} <small>({bloodline.arcana.id})</small>
          </Heading>
          <Text dangerouslySetInnerHTML={{ __html: bloodline.arcana.desc }} whiteSpace="pre-wrap" />
        </Box>
      ) : null}

      <Box>
        {bloodline.powers.map((p) => (
          <Box key={p.id} p="2" border="1px" borderColor="gray.200" mb="2" borderRadius="md">
            <Heading as="h5" color={ENTITY_COLORS.classFeat} fontSize="lg" mb="2">
              {p.name} <small>({p.id})</small>
            </Heading>
            <Text dangerouslySetInnerHTML={{ __html: p.desc }} whiteSpace="pre-wrap" />
          </Box>
        ))}
      </Box>

      <Heading as="h4" fontSize="md" my="4">
        血统专长
      </Heading>
      {bloodline.feats ? (
        <SimpleGrid columns={[1, 2]} spacing="2">
          {bloodline.feats?.map((s) => {
            const { id } = collections.feat.matchFeatIdWithInput(s);
            const feat = collections.feat.getById(id);

            return <SimpleEntity entity={feat} key={feat.id} />;
          })}
        </SimpleGrid>
      ) : null}

      <Heading as="h4" fontSize="md" my="4">
        血统法术
      </Heading>
      {bloodline.spells ? (
        <SimpleGrid columns={[1, 2]} spacing="2">
          {bloodline.spells?.map((s) => {
            const spell = collections.spell.getById(s);

            return <SimpleEntity entity={spell} key={spell.id} />;
          })}
        </SimpleGrid>
      ) : null}
    </Box>
  );
}
