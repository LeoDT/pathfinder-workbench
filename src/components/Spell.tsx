import './Spell.scss';

import { memo } from 'react';
import { Box, Heading, Badge, Text, Stack, Table, Tbody, Tr, Td } from '@chakra-ui/react';

import { ENTITY_COLORS } from '../constant';
import { Spell as SpellType, SpellMeta as SpellMetaType } from '../types/core';
import { schoolTranslates, translates as spellTranslates } from '../utils/spell';

interface Props {
  spell: SpellType;
  showName?: boolean;
  showMeta?: boolean;
  showDescription?: boolean;
  showId?: boolean;
}

export function SpellMeta({ spell }: Props): JSX.Element {
  return (
    <Table size="sm" mt="2">
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

export function Spell({
  spell,
  showName = true,
  showMeta = true,
  showDescription = true,
  showId = false,
}: Props): JSX.Element {
  return (
    <Box className="spell">
      {showName ? (
        <Stack direction="row" align="center">
          <Badge minW="3em" textAlign="center" px="0">
            {schoolTranslates[spell.meta.school].slice(0, 2)}
          </Badge>
          <Heading as="h4" fontSize="lg" color={ENTITY_COLORS.spell}>
            {spell.name}{' '}
            {showId ? <small style={{ fontWeight: 'normal' }}>({spell.id})</small> : null}
          </Heading>
        </Stack>
      ) : null}

      {showMeta ? <SpellMeta spell={spell} /> : null}

      {showDescription ? (
        <Text
          pt="1"
          whiteSpace="pre-wrap"
          dangerouslySetInnerHTML={{ __html: spell.desc }}
          className="spell-description"
        />
      ) : null}
    </Box>
  );
}

export default memo(Spell);

export function spellAsLabelRenderer(spell: SpellType): JSX.Element {
  return (
    <>
      <Badge minW="3em" textAlign="center" px="0">
        {schoolTranslates[spell.meta.school].slice(0, 2)}
      </Badge>
      <Text pl="2" display="inline">
        {spell.name}
      </Text>
    </>
  );
}
