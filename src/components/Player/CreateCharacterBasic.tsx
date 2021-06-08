import { isEmpty, without } from 'lodash-es';
import { Observer } from 'mobx-react-lite';

import { Badge, Box, Button, HStack, Input, Spacer, Text, VStack } from '@chakra-ui/react';

import { useStore } from '../../store';
import { useCreateCharacterStore } from '../../store/createCharacter';
import { ABILITY_TYPES, abilityTranslates, getScoreCost } from '../../utils/ability';
import { BASE_ABILITY, MAXIMUM_ABILITY_SCORE, MINIMUM_ABILITY_SCORE } from '../../utils/ability';
import { constraintAppliedAlignmentOptions } from '../../utils/alignment';
import { favoredClassBonusOptions } from '../../utils/upgrade';
import AbilityInput from '../AbilityInput';
import { ClassPicker } from '../ClassPicker';
import { CollectionEntityPickerPopover } from '../CollectionEntityPicker';
import RacePicker from '../RacePicker';
import Select, { MultipleSelect } from '../Select';

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
              <VStack alignItems="flex-end">
                <RacePicker
                  value={{
                    raceId: character.raceId,
                    alternateRaceTraitIds: character.alternateRaceTraitIds,
                  }}
                  onChange={({ raceId, alternateRaceTraitIds }) => {
                    character.setRace(raceId, alternateRaceTraitIds);
                  }}
                />
                <HStack>
                  <Badge colorScheme="blue">{character.race.name}</Badge>
                  {character.alternateRaceTraitIds.map((id) => {
                    const t = character.racialTraits.find((t) => t.id === id);

                    return t ? (
                      <Badge key={id} colorScheme="teal">
                        {t.name}
                      </Badge>
                    ) : null;
                  })}
                </HStack>
              </VStack>
            </HStack>
            {isEmpty(character.race.ability) ? (
              <HStack w="full" spacing="0" pb="2" borderBottom="1px" borderColor="gray.200">
                <Text fontSize="lg">能力奖励({character.maxBonusAbilityType}项)</Text>
                <Spacer />
                <MultipleSelect
                  options={ABILITY_TYPES.map((t) => ({
                    text: abilityTranslates[t],
                    value: t,
                    key: t,
                  }))}
                  value={character.bonusAbilityType}
                  onChange={(v) => {
                    character.bonusAbilityType = v;
                  }}
                  max={character.maxBonusAbilityType}
                />
              </HStack>
            ) : null}
            <HStack w="full" spacing="0" pb="2" borderBottom="1px" borderColor="gray.200">
              <Text fontSize="lg">职业</Text>
              <Spacer />
              <VStack alignItems="flex-end">
                <ClassPicker
                  value={{
                    classId: create.upgrade.classId,
                    archetypeIds: create.upgrade.archetypeIds,
                  }}
                  onChange={({ classId, archetypeIds: archetypeId }) => {
                    create.updateClass(classId, archetypeId);
                  }}
                />
                <HStack>
                  <Badge colorScheme="blue">
                    {store.collections.class.getById(create.upgrade.classId).name}
                  </Badge>
                  <>
                    {create.upgrade.archetypeIds
                      ? store.collections.archetype
                          .getByIds(create.upgrade.archetypeIds)
                          .map((a) => (
                            <Badge colorScheme="teal" key={a.id}>
                              {a.name}
                            </Badge>
                          ))
                      : null}
                  </>
                </HStack>
              </VStack>
            </HStack>
            <HStack w="full" spacing="0" pb="2" borderBottom="1px" borderColor="gray.200">
              <Text fontSize="lg">天赋职业</Text>
              <Spacer />
              <VStack alignItems="flex-end">
                <CollectionEntityPickerPopover
                  text="选择天赋职业"
                  collection={store.collections.class}
                  items={create.character.favoredClassIds}
                  onPick={
                    create.character.favoredClassIds.length < create.character.maxFavoredClass
                      ? (c) => {
                          create.character.favoredClassIds.push(c);
                        }
                      : undefined
                  }
                  onUnpick={(c) => {
                    create.character.favoredClassIds = without(create.character.favoredClassIds, c);
                  }}
                  listAll
                />
                <HStack>
                  {create.character.favoredClassIds.map((cId) => {
                    const clas = store.collections.class.getById(cId);

                    return (
                      <Badge key={cId} colorScheme="blue">
                        {clas.name}
                      </Badge>
                    );
                  })}
                </HStack>
              </VStack>
            </HStack>
            <HStack w="full" spacing="0" pb="2" borderBottom="1px" borderColor="gray.200">
              <Text fontSize="lg">阵营</Text>
              <Spacer />
              <Select
                options={constraintAppliedAlignmentOptions(create.class.alignment)}
                value={character.alignment}
                onChange={(v) => {
                  character.alignment = v;
                }}
              />
            </HStack>
            {create.character.favoredClassIds.includes(create.upgrade.classId) ? (
              <HStack w="full" spacing="0" pb="2" borderBottom="1px" borderColor="gray.200">
                <Text fontSize="lg">天赋职业奖励</Text>
                <Spacer />
                <Select
                  options={favoredClassBonusOptions}
                  value={create.upgrade.favoredClassBonus}
                  onChange={(v) => {
                    create.upgrade.favoredClassBonus = v;
                  }}
                />
              </HStack>
            ) : null}
          </VStack>
        )}
      </Observer>
      <Observer>
        {() => {
          return (
            <>
              <HStack my="2">
                <Text fontSize="lg">点数: {create.abilityPointsRemain} / 25</Text>
                <Button size="xs" onClick={() => create.resetAbility()}>
                  重置
                </Button>
              </HStack>
              <VStack alignItems="start">
                {ABILITY_TYPES.map((ab) => {
                  const score = create.character.baseAbility[ab];

                  return (
                    <AbilityInput
                      key={ab}
                      ability={ab}
                      score={score}
                      racial={character.bonusAbility[ab]}
                      onChange={(v) => {
                        create.upgrade.abilities[ab] = v - BASE_ABILITY;
                      }}
                      isIncreaseDisabled={
                        create.abilityPointsRemain <= 0 ||
                        getScoreCost(score + 1) - getScoreCost(score) > create.abilityPointsRemain
                      }
                      min={MINIMUM_ABILITY_SCORE}
                      max={MAXIMUM_ABILITY_SCORE}
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
