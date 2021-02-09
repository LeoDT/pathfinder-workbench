import './Spell.scss';

import { Box, Heading, Badge, Text, Stack, Table, Tbody, Tr, Td } from '@chakra-ui/react';

import { Spell as SpellType, SpellMeta as SpellMetaType } from '../store/types';
import { translates as spellTranslates } from '../utils/spell';

interface Props {
  spell: SpellType;
}

export function SpellMeta({ spell }: Props): JSX.Element {
  return (
    <Table size="sm">
      <Tbody>
        {(Object.keys(spell.meta) as Array<keyof SpellMetaType>).map((k) => (
          <Tr key={k}>
            <Td pl="0" color="blue.500" width="8em">
              {spellTranslates[k]}
            </Td>
            <Td>{spell.meta[k]}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

export default function Spell({ spell }: Props): JSX.Element {
  return (
    <Box border="1px" borderColor="gray.200" p="2" mb="2" className="spell">
      <Stack direction="row" align="center" mb="2">
        <Badge>{spell.book.toUpperCase()}</Badge>
        <Heading as="h4" fontSize="lg" color="purple.600">
          {spell.name} <small style={{ fontWeight: 'normal' }}>({spell.id})</small>
        </Heading>
      </Stack>

      <SpellMeta spell={spell} />

      <Text
        pt="1"
        whiteSpace="pre-wrap"
        dangerouslySetInnerHTML={{ __html: spell.description }}
        className="spell-description"
      />
    </Box>
  );
}
