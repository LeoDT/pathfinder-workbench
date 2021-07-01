import { memo } from 'react';
import {
  GiAerialSignal,
  GiBrain,
  GiBullseye,
  GiFist,
  GiFlyingFlag,
  GiShield,
} from 'react-icons/gi';

import { Box, Icon } from '@chakra-ui/react';

import { ABILITY_COLORS } from '../constant';
import { AbilityType } from '../types/core';

const icons = {
  str: { icon: GiFist, color: ABILITY_COLORS.str },
  dex: { icon: GiBullseye, color: ABILITY_COLORS.dex },
  con: { icon: GiShield, color: ABILITY_COLORS.con },
  int: { icon: GiBrain, color: ABILITY_COLORS.int },
  wis: { icon: GiAerialSignal, color: ABILITY_COLORS.wis },
  cha: { icon: GiFlyingFlag, color: ABILITY_COLORS.cha },
};

interface Props {
  ability: AbilityType;
  iconSize?: number | number[];
}

export function RawAbilityIcon({ ability, iconSize = 8 }: Props): JSX.Element {
  const { icon, color } = icons[ability];

  return (
    <Box bgColor={color} p="1" borderRadius="md">
      <Icon as={icon} color="white" w={iconSize} h={iconSize} />
    </Box>
  );
}

export const AbilityIcon = memo(RawAbilityIcon);
