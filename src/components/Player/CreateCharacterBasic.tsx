import { isEmpty } from 'lodash-es';
import { Observer } from 'mobx-react-lite';
import { Button, Box, VStack, Text, HStack, Spacer, Input } from '@chakra-ui/react';

import { useStore } from '../../store';
import { useCreateCharacterStore } from '../../store/createCharacter';
import { ABILITY_TYPES, getScoreCost, abilityTranslates } from '../../utils/ability';

import AbilityInput from '../AbilityInput';
import CollectionEntitySelect from '../CollectionEntitySelect';
import Select from '../Select';
import ClassSpecialityPickerToggler from '../ClassSpecialityPickerToggler';
import ClassSpecialityDisplayer from '../ClassSpecialityDisplayer';

export default function CreateCharacterBasic(): JSX.Element {
  const store = useStore();
  const create = useCreateCharacterStore();
  const { character } = create;

  return (
    <Box maxW="sm">
      <Observer>
        {() => (
          <VStack w="full">
            <HStack w="full" pb="2" borderBottom="1px" borderColor="gray.200">
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
            <HStack w="full" spacing="0" pb="2" borderBottom="1px" borderColor="gray.200">
              <Text fontSize="lg">种族</Text>
              <Spacer />
              <CollectionEntitySelect
                collection={store.collections.race}
                value={character.raceId}
                onChange={(id) => {
                  character.raceId = id;

                  create.resetUpgradeFeats();
                }}
              />
            </HStack>
            {isEmpty(character.race.ability) ? (
              <HStack w="full" spacing="0" pb="2" borderBottom="1px" borderColor="gray.200">
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
            ) : null}
            <HStack w="full" spacing="0" pb="2" borderBottom="1px" borderColor="gray.200">
              <Text fontSize="lg">职业</Text>
              <Spacer />
              <CollectionEntitySelect
                collection={store.collections.class}
                value={create.upgrade.classId}
                onChange={(id) => {
                  create.updateClass(id);
                }}
              />
            </HStack>
            {create.newGainedClassSpeciality.map((e) => (
              <HStack
                key={e.type}
                w="full"
                spacing="0"
                pb="2"
                borderBottom="1px"
                borderColor="gray.200"
              >
                <Text fontSize="lg">职业特性</Text>
                <Spacer />
                <VStack alignItems="flex-end">
                  <ClassSpecialityPickerToggler
                    effect={e}
                    value={create.upgrade.classSpeciality}
                    onChange={(v) => {
                      create.upgrade.classSpeciality = v;
                    }}
                  />
                  {create.upgrade.classSpeciality ? (
                    <ClassSpecialityDisplayer classSpeciality={create.upgrade.classSpeciality} />
                  ) : null}
                </VStack>
              </HStack>
            ))}
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
