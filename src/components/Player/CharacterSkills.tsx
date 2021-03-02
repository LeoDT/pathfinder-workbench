import { Observer } from 'mobx-react-lite';
import { Box, VStack } from '@chakra-ui/react';

import { useStore } from '../../store';
import { useCurrentCharacter } from '../../store/character';

import SkillInput from '../SkillInput';

export default function CharacterSkills(): JSX.Element {
  const store = useStore();
  const character = useCurrentCharacter();

  return (
    <Box maxW="sm">
      <Observer>
        {() => (
          <VStack align="start" w="full">
            {store.collections.skill.data.map((s) => (
              <SkillInput
                key={s.id}
                skill={s}
                onChange={(r) => {
                  character.skillRanks.set(s.id, r);
                }}
                max={character.level}
                min={0}
                {...character.getSkillDetail(s)}
              />
            ))}
          </VStack>
        )}
      </Observer>
    </Box>
  );
}
