import { Box, Icon } from '@chakra-ui/react';
import { memo } from 'react';
import {
  GiFist,
  GiBullseye,
  GiShield,
  GiBrain,
  GiAerialSignal,
  GiFlyingFlag,
} from 'react-icons/gi';

import { AbilityType } from '../store/types';

const icons = {
  str: { icon: GiFist, color: 'orange.500' },
  dex: { icon: GiBullseye, color: 'green.500' },
  con: { icon: GiShield, color: 'red.500' },
  int: { icon: GiBrain, color: 'yellow.500' },
  wis: { icon: GiAerialSignal, color: 'cyan.500' },
  cha: { icon: GiFlyingFlag, color: 'pink.500' },
};

export function AbilityIcon({ ability }: { ability: AbilityType }): JSX.Element {
  const { icon, color } = icons[ability];

  return (
    <Box bgColor={color} p="1" borderRadius="md">
      <Icon as={icon} color="white" w={8} h={8} />
    </Box>
  );
}

export default memo(AbilityIcon);
