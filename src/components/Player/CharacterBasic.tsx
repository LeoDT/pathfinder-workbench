import { isEmpty } from 'lodash-es';
import { Observer } from 'mobx-react-lite';
import { Button, Box, VStack, Text, HStack, Spacer, Divider } from '@chakra-ui/react';

import { useStore } from '../../store';
import { useCurrentCharacter } from '../../store/character';
import {
  ABILITY_TYPES,
  getScoreCost,
  ABILITY_POINTS,
  abilityTranslates,
} from '../../utils/ability';

import AbilityInput from '../AbilityInput';
import CollectionEntitySelect from '../CollectionEntitySelect';
import Select from '../Select';

export default function CharacterBasic(): JSX.Element {
  const store = useStore();
  const character = useCurrentCharacter();

  return (
    <Box maxW="sm">
      <Observer>
        {() => (
          <VStack w="full">
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
                value={character.classId}
                onChange={(id) => {
                  character.classId = id;
                }}
              />
            </HStack>
            <Divider />
          </VStack>
        )}
      </Observer>
      <Observer>
        {() => {
          const remainPoints = ABILITY_POINTS - character.abilityCost;

          return (
            <>
              <HStack my="2">
                <Text fontSize="lg">点数: {remainPoints} / 25</Text>
                <Button size="xs" onClick={() => character.resetBaseAbility()}>
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
                        character.abilityCost >= ABILITY_POINTS ||
                        getScoreCost(score + 1) - getScoreCost(score) > remainPoints
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
