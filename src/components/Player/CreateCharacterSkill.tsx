import { without } from 'lodash-es';
import { useState } from 'react';
import { Observer } from 'mobx-react-lite';
import { Button, Box, VStack, HStack, Text, Icon, Spacer } from '@chakra-ui/react';
import { FaStar } from 'react-icons/fa';

import { useStore } from '../../store';
import { useCreateCharacterStore } from '../../store/createCharacter';

import SkillInput from '../SkillInput';
import AbilityIcon from '../AbilityIcon';

export default function CreateCharacterSkills(): JSX.Element {
  const store = useStore();
  const create = useCreateCharacterStore();
  const { character } = create;
  const [collapsedCategory, setCollapsedCategory] = useState([
    'craft',
    'knowledge',
    'perform',
    'profession',
  ]);

  return (
    <Box maxW="sm">
      <Observer>
        {() => (
          <VStack align="start" w="full">
            <Text fontSize="lg">
              技能点数: {create.skillPointsRemain} / {create.skillPoints}
            </Text>

            {store.collections.skill.data.map((s) => {
              if (s.category) {
                const collapsed = collapsedCategory.includes(s.id);

                return (
                  <HStack w="full" key={s.id}>
                    <AbilityIcon ability={s.ability} />
                    <Text fontSize="large">
                      {s.name}
                      {character.isClassSkill(s) ? <Icon as={FaStar} color="gray.600" /> : null}
                    </Text>
                    <Spacer />
                    <Button
                      onClick={() => {
                        setCollapsedCategory(
                          collapsed
                            ? without(collapsedCategory, s.id)
                            : [...collapsedCategory, s.id]
                        );
                      }}
                    >
                      {collapsed ? '展开' : '收起'}
                    </Button>
                  </HStack>
                );
              }

              if (s.parent && collapsedCategory.includes(s.parent)) {
                return null;
              }

              return (
                <SkillInput
                  key={s.id}
                  skill={s}
                  onChange={(r) => {
                    create.upgrade.skills.set(s.id, r);
                  }}
                  max={character.level}
                  min={0}
                  noMorePoints={create.skillPointsRemain <= 0}
                  {...character.getSkillDetail(s)}
                />
              );
            })}
          </VStack>
        )}
      </Observer>
    </Box>
  );
}
