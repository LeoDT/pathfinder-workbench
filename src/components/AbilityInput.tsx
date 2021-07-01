import { FaMinus, FaPlus } from 'react-icons/fa';

import { ButtonGroup, HStack, IconButton, Spacer, Text } from '@chakra-ui/react';

import { AbilityType } from '../types/core';
import { getModifierFromScore } from '../utils/ability';
import { showModifier } from '../utils/modifier';
import { AbilityIcon } from './AbilityIcon';
import { StatNumber } from './StatNumber';

interface Props {
  ability: AbilityType;
  score: number;
  onChange: (s: number) => void;
  max?: number;
  min?: number;
  isIncreaseDisabled?: boolean;
  isDecreaseDisabled?: boolean;
  racial?: number;
}

export function AbilityInput({
  ability,
  score,
  onChange,
  max = Infinity,
  min = 0,
  racial = 0,
  isIncreaseDisabled = false,
  isDecreaseDisabled = false,
}: Props): JSX.Element {
  return (
    <HStack w="full">
      <AbilityIcon ability={ability} />
      <Text fontSize="lg" fontFamily="mono">
        {ability.toUpperCase()}
      </Text>
      <Spacer />
      <StatNumber number={showModifier(getModifierFromScore(score + racial))} text="mod" />
      <StatNumber number={showModifier(racial)} text="racial" />
      <StatNumber number={score + racial} text="score" />

      <ButtonGroup isAttached>
        <IconButton
          aria-label="Decrease Ability"
          icon={<FaMinus />}
          onClick={() => onChange(score - 1)}
          size="sm"
          isDisabled={score <= min || isDecreaseDisabled}
        />
        <IconButton
          aria-label="Increase Ability"
          icon={<FaPlus />}
          onClick={() => onChange(score + 1)}
          size="sm"
          isDisabled={score >= max || isIncreaseDisabled}
        />
      </ButtonGroup>
    </HStack>
  );
}
