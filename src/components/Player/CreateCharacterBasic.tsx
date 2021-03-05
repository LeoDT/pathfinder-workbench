import { isEmpty } from 'lodash-es';
import { Observer } from 'mobx-react-lite';
import { Button, Box, VStack, Text, HStack, Spacer, Divider, Input } from '@chakra-ui/react';

import { useStore } from '../../store';
import { useCreateCharacterStore } from '../../store/createCharacter';
import { ABILITY_TYPES, getScoreCost, abilityTranslates } from '../../utils/ability';

import AbilityInput from '../AbilityInput';
import CollectionEntitySelect from '../CollectionEntitySelect';
import Select from '../Select';

export default function CreateCharacterBasic(): JSX.Element {
  const store = useStore();
  const create = useCreateCharacterStore();
  const { character } = create;

  return (
    <Box maxW="sm">
      <Observer>
        {() => (
          <VStack w="full">
            <HStack w="full">
              <Text fontSize="lg" whiteSpace="nowrap">
                姓名
              </Text>
              <Spacer />
              <Input
                value={character.name}
                onChange={(e) => {
                  character.name = e.target.value;
                }}
                textAlign="right"
                variant="unstyled"
                maxW="50%"
              />
            </HStack>
            <Divider />
            <HStack w="full" spacing="0">
              <Text fontSize="lg">种族</Text>
              <Spacer />
              <CollectionEntitySelect
                collection={store.collections.race}
                value={character.raceId}
                onChange={(id) => {
                  character.raceId = id;
                }}
              />
            </HStack>
            <Divider />
            {isEmpty(character.race.ability) ? (
              <>
                <HStack w="full" spacing="0">
                  <Text fontSize="lg">能力奖励</Text>
                  <Spacer />
                  <Select
                    options={ABILITY_TYPES.map((t) => ({
                      text: abilityTranslates[t],
                      value: t,
                      key: t,
                    }))}
                    value={character.bonusAbilityType}
                    onChange={(v) => {
                      character.bonusAbilityType = v;
                    }}
                  />
                </HStack>
                <Divider />
              </>
            ) : null}
            <HStack w="full" spacing="0">
              <Text fontSize="lg">职业</Text>
              <Spacer />
              <CollectionEntitySelect
                collection={store.collections.class}
                value={create.upgrade.classId}
                onChange={(id) => {
                  create.upgrade.classId = id;
                }}
              />
            </HStack>
            <Divider />
          </VStack>
        )}
      </Observer>
      <Observer>
        {() => {
          return (
            <>
              <HStack my="2">
                <Text fontSize="lg">点数: {create.abilityPointsRemain} / 25</Text>
                <Button size="xs" onClick={() => create.resetBaseAbility()}>
                  重置
                </Button>
              </HStack>
              <VStack alignItems="start">
                {ABILITY_TYPES.map((ab) => {
                  const score = character.baseAbility[ab];

                  return (
                    <AbilityInput
                      key={ab}
                      ability={ab}
                      score={score}
                      racial={character.bonusAbility[ab]}
                      onChange={(v) => {
                        character.baseAbility[ab] = v;
                      }}
                      isIncreaseDisabled={
                        create.abilityPointsRemain <= 0 ||
                        getScoreCost(score + 1) - getScoreCost(score) > create.abilityPointsRemain
                      }
                    />
                  );
                })}
              </VStack>
            </>
          );
        }}
      </Observer>
    </Box>
  );
}
