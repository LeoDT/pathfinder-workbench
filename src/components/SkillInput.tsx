import { memo } from 'react';
import { HStack, Text, Icon, Spacer, ButtonGroup, IconButton } from '@chakra-ui/react';
import { FaStar, FaMinus, FaPlus } from 'react-icons/fa';

import { Skill, AbilityType } from '../types/core';

import AbilityIcon from './AbilityIcon';
import StatNumber from './StatNumber';

export function SkillIcon({
  ability,
  name,
  isClassSkill,
}: {
  ability: AbilityType;
  name: string;
  isClassSkill: boolean;
}): JSX.Element {
  return (
    <>
      <AbilityIcon ability={ability} />
      <Text fontSize="lg">
        {name} {isClassSkill ? <Icon as={FaStar} color="gray.600" /> : null}
      </Text>
    </>
  );
}
export const MemorizedSkillIcon = memo(SkillIcon);

interface Props {
  skill: Skill;
  rank: number;
  total: number;
  modifier: number;
  fromEffect: number;
  isClassSkill: boolean;
  max: number;
  min: number;
  isIncreaseDisabled?: boolean;
  isDecreaseDisabled?: boolean;
  onChange: (s: number) => void;
}

export default function SkillInput({
  skill,
  rank,
  modifier,
  total,
  fromEffect,
  isClassSkill,
  max,
  min,
  isIncreaseDisabled,
  isDecreaseDisabled,
  onChange,
}: Props): JSX.Element {
  return (
    <HStack w="full">
      <MemorizedSkillIcon name={skill.name} ability={skill.ability} isClassSkill={isClassSkill} />
      <Spacer />
      <StatNumber number={rank} text="rank" />
      <StatNumber number={modifier} text="mod" />
      <StatNumber number={fromEffect} text="misc" />
      <StatNumber number={total} text="total" />

      <ButtonGroup isAttached>
        <IconButton
          aria-label="Decrease Ability"
          icon={<FaMinus />}
          onClick={() => onChange(rank - 1)}
          size="sm"
          disabled={rank <= min || isDecreaseDisabled}
        />
        <IconButton
          aria-label="Increase Ability"
          icon={<FaPlus />}
          onClick={() => onChange(rank + 1)}
          size="sm"
          disabled={rank >= max || isIncreaseDisabled}
        />
      </ButtonGroup>
    </HStack>
  );
}
