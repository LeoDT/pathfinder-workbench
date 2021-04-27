import { range } from 'lodash-es';
import { Observer } from 'mobx-react-lite';
import { Button, Box, VStack, Text, HStack, Spacer } from '@chakra-ui/react';

import { ABILITY_TYPES } from '../../utils/ability';
import { favoredClassBonusOptions } from '../../utils/upgrade';
import { useUpgradeCharacterStore } from '../../store/upgradeCharacter';

import AbilityInput from '../AbilityInput';
import Select from '../Select';

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
            {upgradeStore.character.favoredClassIds.includes(upgradeStore.upgrade.classId) ? (
              <HStack w="full" spacing="0" pb="2" borderBottom="1px" borderColor="gray.200">
                <Text fontSize="lg">天赋职业奖励</Text>
                <Spacer />
                <Select
                  options={favoredClassBonusOptions}
                  value={upgradeStore.upgrade.favoredClassBonus}
                  onChange={(v) => {
                    upgradeStore.upgrade.favoredClassBonus = v;
                  }}
                />
              </HStack>
            ) : null}
            <HStack w="full" spacing="0" pb="2" borderBottom="1px" borderColor="gray.200">
              <Text fontSize="lg">HP({upgradeStore.character.status.hp})</Text>
              <Spacer />
              <Select
                options={range(upgradeStore.class.hd).map((i) => ({
                  text: (i + 1).toString(),
                  value: i + 1,
                }))}
                value={upgradeStore.upgrade.hp}
                onChange={(v) => {
                  upgradeStore.upgrade.hp = v;
                }}
                menuListProps={{ maxH: '30vh', overflowY: 'auto' }}
              />
            </HStack>
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
                    upgradeStore.resetAbility();
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
                        } else {
                          upgradeStore.resetUpgradeAbilityBonus();
                        }
                      }}
                      isIncreaseDisabled={Boolean(upgradeStore.upgradeAbilityBonus)}
                      isDecreaseDisabled={upgradeStore.upgradeAbilityBonus !== ab}
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
