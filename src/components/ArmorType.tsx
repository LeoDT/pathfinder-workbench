import './Feat.scss';

import { memo, useCallback } from 'react';
import { Box, HStack, Heading, Table, Tbody, Tr, Td, Text } from '@chakra-ui/react';

import { ENTITY_COLORS } from '../constant';
import { ArmorType as ArmorTypeType } from '../types/core';
import { armorCategoryTranslates, armorTypeMetaTranslates } from '../utils/armorType';
import { showDistance, showWeight } from '../utils/misc';
import { showModifier } from '../utils/modifier';

interface Props {
  armorType: ArmorTypeType;
  showName?: boolean;
  showDescription?: boolean;
  showMeta?: boolean;
}

function ArmorTypeMeta({ armorType }: { armorType: ArmorTypeType }): JSX.Element {
  const { meta } = armorType;
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
        {row(armorTypeMetaTranslates.category, armorCategoryTranslates[meta.category])}
        {row(armorTypeMetaTranslates.cost, meta.cost)}
        {row(armorTypeMetaTranslates.weight, showWeight(meta.weight))}
        {row(armorTypeMetaTranslates.ac, showModifier(meta.ac))}
        {meta.maxDex ? row(armorTypeMetaTranslates.maxDex, showModifier(meta.maxDex)) : null}
        {row(armorTypeMetaTranslates.penalty, showModifier(meta.penalty))}
        {row(armorTypeMetaTranslates.arcaneFailureChance, meta.arcaneFailureChance)}
        {meta.speed30 ? row(armorTypeMetaTranslates.speed20, showDistance(meta.speed30)) : null}
        {meta.speed20 ? row(armorTypeMetaTranslates.speed30, showDistance(meta.speed20)) : null}
      </Tbody>
    </Table>
  );
}

export function ArmorType({
  armorType,
  showName = true,
  showMeta = true,
  showDescription = true,
}: Props): JSX.Element {
  return (
    <Box className="armor-type">
      {showName ? (
        <HStack direction="row" align="center">
          <Heading as="h4" fontSize="lg" color={ENTITY_COLORS.armorType}>
            {armorType.name} <small style={{ fontWeight: 'normal' }}>({armorType.id})</small>
          </Heading>
        </HStack>
      ) : null}

      {showMeta ? <ArmorTypeMeta armorType={armorType} /> : null}

      {showDescription && armorType.desc ? (
        <Text
          pt="1"
          whiteSpace="pre-wrap"
          dangerouslySetInnerHTML={{ __html: armorType.desc }}
          className="feat-description"
        />
      ) : null}
    </Box>
  );
}

export default memo(ArmorType);
