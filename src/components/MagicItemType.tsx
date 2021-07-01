import { memo, useCallback } from 'react';

import { Badge, Box, HStack, Heading, Table, Tbody, Td, Text, Tr } from '@chakra-ui/react';

import { ENTITY_COLORS } from '../constant';
import { MagicItemType as MagicItemTypeType } from '../types/core';
import {
  magicItemSlotTranslates,
  magicItemTypeMetaTranslates,
  translateMagicItemAura,
} from '../utils/magicItemType';
import { showWeight } from '../utils/misc';

interface Props {
  magicItemType: MagicItemTypeType;
  showName?: boolean;
  showDescription?: boolean;
  showMeta?: boolean;
  showId?: boolean;
}

function MagicItemTypeMeta({ magicItemType }: { magicItemType: MagicItemTypeType }): JSX.Element {
  const { meta } = magicItemType;
  const row = useCallback(
    (name, value) => (
      <Tr>
        <Td pl="0" color="blue.500" width="8em">
          {name}
        </Td>
        <Td>{value}</Td>
      </Tr>
    ),
    [meta]
  );

  return (
    <Table size="sm" mt="2">
      <Tbody>
        {row(magicItemTypeMetaTranslates.price, meta.price)}
        {row(magicItemTypeMetaTranslates.weight, showWeight(meta.weight))}
        {row(magicItemTypeMetaTranslates.casterLevel, meta.casterLevel)}
        {row(magicItemTypeMetaTranslates.aura, translateMagicItemAura(meta.aura))}
      </Tbody>
    </Table>
  );
}

export function RawMagicItemType({
  magicItemType,
  showName = true,
  showMeta = true,
  showDescription = true,
  showId = false,
}: Props): JSX.Element {
  return (
    <Box className="weapon-type">
      {showName ? (
        <HStack direction="row" align="center">
          <Badge>{magicItemSlotTranslates[magicItemType.meta.slot]}</Badge>
          <Heading as="h4" fontSize="lg" color={ENTITY_COLORS.magicItemType}>
            {magicItemType.name}{' '}
            {showId ? <small style={{ fontWeight: 'normal' }}>({magicItemType.id})</small> : null}
          </Heading>
        </HStack>
      ) : null}

      {showMeta ? <MagicItemTypeMeta magicItemType={magicItemType} /> : null}

      {showDescription && magicItemType.desc ? (
        <Text
          pt="1"
          whiteSpace="pre-wrap"
          dangerouslySetInnerHTML={{ __html: magicItemType.desc }}
          className="feat-description"
        />
      ) : null}
    </Box>
  );
}

export const MagicItemType = memo(RawMagicItemType);
