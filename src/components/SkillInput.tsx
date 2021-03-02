import { HStack, Text, Icon, Spacer, ButtonGroup, IconButton } from '@chakra-ui/react';
import { FaStar, FaMinus, FaPlus } from 'react-icons/fa';

import { Skill } from '../store/types';

import AbilityIcon from './AbilityIcon';
import StatNumber from './StatNumber';

interface Props {
  skill: Skill;
  rank: number;
  total: number;
  modifier: number;
  isClassSkill: boolean;
  max: number;
  min: number;
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
  onChange,
}: Props): JSX.Element {
  return (
    <HStack w="full">
      <AbilityIcon ability={skill.ability} />
      <Text fontSize="large">
        {skill.name} {isClassSkill ? <Icon as={FaStar} color="gray.600" /> : null}
      </Text>
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
          disabled={rank >= max}
        />
      </ButtonGroup>
    </HStack>
  );
}
