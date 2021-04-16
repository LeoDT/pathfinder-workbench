import { without } from 'lodash-es';
import { Observer } from 'mobx-react-lite';
import { useState } from 'react';
import { FaStar } from 'react-icons/fa';

import { Box, Button, HStack, Icon, Spacer, Text, VStack } from '@chakra-ui/react';

import { useStore } from '../../store';
import CreateCharacterStore from '../../store/createCharacter';
import { SkillSystem } from '../../types/core';
import AbilityIcon from '../AbilityIcon';
import Select from '../Select';
import SkillInput from '../SkillInput';

interface Props {
  createOrUpgrade: CreateCharacterStore;
}

export default function CreateCharacterSkills({ createOrUpgrade }: Props): JSX.Element {
  const store = useStore();
  const { character } = createOrUpgrade;
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
          <HStack w="full" spacing="0" pb="2" borderBottom="1px" borderColor="gray.200">
            <Text fontSize="lg">技能系统</Text>
            <Spacer />
            <Select
              options={
                [
                  { text: '核心', value: 'core' },
                  { text: '简化', value: 'consolidated' },
                ] as Array<{ text: string; value: SkillSystem }>
              }
              value={character.skillSystem}
              onChange={(v) => {
                character.setSkillSystem(v);
              }}
            />
          </HStack>
        )}
      </Observer>
      <Observer>
        {() => {
          const skillCollection =
            character.skillSystem === 'core'
              ? store.collections.coreSkill
              : store.collections.consolidatedSkill;

          return (
            <VStack align="start" w="full" pt="2">
              <Text fontSize="lg">
                技能点数: {createOrUpgrade.skillPointsRemain} / {createOrUpgrade.skillPoints}
              </Text>

              {skillCollection.data.map((s) => {
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

                const baseSkillRank = character.skillRanksWithoutPending.get(s.id) || 0;

                return (
                  <SkillInput
                    key={s.id}
                    skill={s}
                    onChange={(r) => {
                      createOrUpgrade.upgrade.skills.set(s.id, r - baseSkillRank);
                    }}
                    max={character.level}
                    min={baseSkillRank}
                    isIncreaseDisabled={createOrUpgrade.skillPointsRemain <= 0}
                    {...character.getSkillDetail(s)}
                  />
                );
              })}
            </VStack>
          );
        }}
      </Observer>
    </Box>
  );
}
