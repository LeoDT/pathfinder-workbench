import { Observer } from 'mobx-react-lite';
import { Button, Box, VStack, Text, HStack, Spacer } from '@chakra-ui/react';

import { ABILITY_TYPES } from '../../utils/ability';
import { useUpgradeCharacterStore } from '../../store/upgradeCharacter';

import AbilityInput from '../AbilityInput';
import Select from '../Select';
import ClassSpecialityPickerToggler from '../ClassSpecialityPickerToggler';
import ClassSpecialityDisplayer from '../ClassSpecialityDisplayer';

export default function CreateCharacterBasic(): JSX.Element {
  const upgradeStore = useUpgradeCharacterStore();

  return (
    <Box maxW="sm">
      <Observer>
        {() => (
          <VStack w="full">
            <HStack w="full" spacing="0" pb="2" borderBottom="1px" borderColor="gray.200">
              <Text fontSize="lg">升级职业</Text>
              <Spacer />
              <Select
                options={upgradeStore.classOptions}
                value={upgradeStore.upgrade.classId}
                onChange={(id) => {
                  upgradeStore.updateClass(id);
                }}
              />
            </HStack>
            {upgradeStore.newGainedClassSpeciality.map((e) => (
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
                    value={upgradeStore.upgrade.classSpeciality}
                    onChange={(v) => {
                      upgradeStore.upgrade.classSpeciality = v;
                    }}
                  />
                  {upgradeStore.upgrade.classSpeciality ? (
                    <ClassSpecialityDisplayer
                      classSpeciality={upgradeStore.upgrade.classSpeciality}
                    />
                  ) : null}
                </VStack>
              </HStack>
            ))}
          </VStack>
        )}
      </Observer>
      <Observer>
        {() => {
          return upgradeStore.gainUpgradeAbilityBonus ? (
            <>
              <HStack my="2">
                <Text fontSize="lg">点数: {upgradeStore.upgradeAbilityBonus ? 0 : 1}</Text>
                <Button
                  size="xs"
                  onClick={() => {
                    upgradeStore.resetBaseAbility();
                    upgradeStore.resetUpgradeAbilityBonus();
                  }}
                >
                  重置
                </Button>
              </HStack>
              <VStack alignItems="start">
                {ABILITY_TYPES.map((ab) => {
                  const score = upgradeStore.character.baseAbility[ab];

                  return (
                    <AbilityInput
                      key={ab}
                      ability={ab}
                      score={score}
                      racial={upgradeStore.character.bonusAbility[ab]}
                      onChange={(v) => {
                        if (v > score) {
                          upgradeStore.useUpgradeAbilityBonus(ab);
                        }

                        upgradeStore.resetUpgradeAbilityBonus();
                      }}
                      isIncreaseDisabled={Boolean(upgradeStore.upgradeAbilityBonus)}
                    />
                  );
                })}
              </VStack>
            </>
          ) : null;
        }}
      </Observer>
    </Box>
  );
}
