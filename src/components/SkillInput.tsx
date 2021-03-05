import { memo } from 'react';
import { HStack, Text, Icon, Spacer, ButtonGroup, IconButton } from '@chakra-ui/react';
import { FaStar, FaMinus, FaPlus } from 'react-icons/fa';

import { Skill, AbilityType } from '../store/types';

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
      <Text fontSize="large">
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
  isClassSkill: boolean;
  max: number;
  min: number;
  noMorePoints: boolean;
  onChange: (s: number) => void;
}

export default function SkillInput({
  skill,
  rank,
  modifier,
  total,
  isClassSkill,
  max,
  min,
  noMorePoints,
  onChange,
}: Props): JSX.Element {
  return (
    <HStack w="full">
      <MemorizedSkillIcon name={skill.name} ability={skill.ability} isClassSkill={isClassSkill} />
      <Spacer />
      <StatNumber number={rank} text="rank" />
      <StatNumber number={modifier} text="mod" />
      <StatNumber number={total} text="total" />

      <ButtonGroup isAttached>
        <IconButton
          aria-label="Decrease Ability"
          icon={<FaMinus />}
          onClick={() => onChange(rank - 1)}
          size="sm"
          disabled={rank <= min}
        />
        <IconButton
          aria-label="Increase Ability"
          icon={<FaPlus />}
          onClick={() => onChange(rank + 1)}
          size="sm"
          disabled={rank >= max || noMorePoints}
        />
      </ButtonGroup>
    </HStack>
  );
}
