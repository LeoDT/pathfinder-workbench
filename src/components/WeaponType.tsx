import { memo, useCallback } from 'react';

import { Badge, Box, HStack, Heading, Table, Tbody, Td, Text, Tr } from '@chakra-ui/react';

import { ENTITY_COLORS } from '../constant';
import { useStore } from '../store';
import { WeaponType as WeaponTypeType } from '../types/core';
import { showDistance, showWeight } from '../utils/misc';
import {
  translateWeaponTypeMetaDamageType,
  weaponCategoryTranslates,
  weaponSpecialTranslates,
  weaponTrainingTranslates,
  weaponTypeMetaTranslates,
} from '../utils/weaponType';

interface Props {
  weaponType: WeaponTypeType;
  showName?: boolean;
  showDescription?: boolean;
  showMeta?: boolean;
  showId?: boolean;
}

function WeaponTypeMeta({ weaponType }: { weaponType: WeaponTypeType }): JSX.Element {
  const { collections } = useStore();
  const { meta } = weaponType;
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
        {row(weaponTypeMetaTranslates.training, weaponTrainingTranslates[meta.training])}
        {row(weaponTypeMetaTranslates.cost, meta.cost)}
        {row(weaponTypeMetaTranslates.weight, showWeight(meta.weight))}
        {row(weaponTypeMetaTranslates.damage, meta.damage)}
        {meta.damageType
          ? row(
              weaponTypeMetaTranslates.damageType,
              translateWeaponTypeMetaDamageType(meta.damageType)
            )
          : null}
        {meta.critical ? row(weaponTypeMetaTranslates.critical, meta.critical) : null}
        {meta.range ? row(weaponTypeMetaTranslates.range, showDistance(meta.range)) : null}
        {meta.special
          ? row(
              weaponTypeMetaTranslates.special,
              meta.special.map((s) => weaponSpecialTranslates[s]).join(', ')
            )
          : null}
        {meta.fighterWeaponTrainingGroup
          ? row(
              weaponTypeMetaTranslates.fighterWeaponTrainingGroup,
              meta.fighterWeaponTrainingGroup
                .map((s) => collections.fighterWeaponTrainingGroup.getById(s).name)
                .join(', ')
            )
          : null}
      </Tbody>
    </Table>
  );
}

export function RawWeaponType({
  weaponType,
  showName = true,
  showMeta = true,
  showDescription = true,
  showId = false,
}: Props): JSX.Element {
  return (
    <Box className="weapon-type">
      {showName ? (
        <HStack direction="row" align="center">
          <Badge>{weaponCategoryTranslates[weaponType.meta.category]}</Badge>
          <Heading as="h4" fontSize="lg" color={ENTITY_COLORS.weaponType}>
            {weaponType.name}{' '}
            {showId ? <small style={{ fontWeight: 'normal' }}>({weaponType.id})</small> : null}
          </Heading>
        </HStack>
      ) : null}

      {showMeta ? <WeaponTypeMeta weaponType={weaponType} /> : null}

      {showDescription && weaponType.desc ? (
        <Text
          pt="1"
          whiteSpace="pre-wrap"
          dangerouslySetInnerHTML={{ __html: weaponType.desc }}
          className="feat-description"
        />
      ) : null}
    </Box>
  );
}

export const WeaponType = memo(RawWeaponType);
