import { HStack, VStack, Spacer, IconButton, Text, ButtonGroup } from '@chakra-ui/react';
import { FaPlus, FaMinus } from 'react-icons/fa';

import { AbilityType } from '../store/types';
import {
  getModifierFromScore,
  showModifier,
  MAXIMUM_ABILITY_SCORE,
  MINIMUM_ABILITY_SCORE,
} from '../utils/ability';

import AbilityIcon from './AbilityIcon';

interface Props {
  ability: AbilityType;
  score: number;
  onChange: (s: number) => void;
  max?: number;
  min?: number;
  isIncreaseDisabled?: boolean;
  racial?: number;
}

function AbilityNumber({ number, text }: { number: string | number; text: string }) {
  return (
    <VStack spacing="0">
      <Text fontSize="large" textAlign="center" lineHeight="1">
        {number}
      </Text>
      <Text fontSize="xs" color="gray.500" lineHeight="1">
        {text}
      </Text>
    </VStack>
  );
}

export default function AbilityInput({
  ability,
  score,
  onChange,
  max = MAXIMUM_ABILITY_SCORE,
  min = MINIMUM_ABILITY_SCORE,
  racial = 0,
  isIncreaseDisabled = false,
}: Props): JSX.Element {
  return (
    <HStack w="full">
      <AbilityIcon ability={ability} />
      <Text fontSize="lg" fontFamily="mono">
        {ability.toUpperCase()}
      </Text>
      <Spacer />
      <AbilityNumber number={showModifier(getModifierFromScore(score + racial))} text="mod" />
      <AbilityNumber number={showModifier(racial)} text="racial" />
      <AbilityNumber number={score + racial} text="score" />

      <ButtonGroup isAttached>
        <IconButton
          aria-label="Decrease Ability"
          icon={<FaMinus />}
          onClick={() => onChange(score - 1)}
          size="sm"
          isDisabled={score <= min}
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
