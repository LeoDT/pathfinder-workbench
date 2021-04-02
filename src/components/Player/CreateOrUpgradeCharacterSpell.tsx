import { without } from 'lodash-es';
import { useCallback } from 'react';
import { Observer } from 'mobx-react-lite';
import { Box, SimpleGrid, Text, Heading } from '@chakra-ui/react';

import Spellbook from '../../store/spellbook';
import { useStore } from '../../store';

import SimpleEntity from '../SimpleEntity';
import { EntityPickerPopover } from '../EntityPicker';
import CreateCharacterStore from '../../store/createCharacter';

interface SpellsForLevelProps {
  spellbook: Spellbook;
  level: number;
  perday: number;
  createOrUpgrade: CreateCharacterStore;
}

function SpellsForLevel({ createOrUpgrade, spellbook, level, perday }: SpellsForLevelProps) {
  const { collections } = useStore();

  const onPick = useCallback((v) => {
    createOrUpgrade.upgrade.spells.push(v);
  }, []);
  const onUnpick = useCallback((v) => {
    createOrUpgrade.upgrade.spells = without(createOrUpgrade.upgrade.spells, v);
  }, []);

  return (
    <Observer>
      {() => {
        const spells = createOrUpgrade.upgrade.spells.filter(
          (s) =>
            collections.spell.getSpellLevelForClass(s, createOrUpgrade.upgrade.classId) === level
        );
        // knownSpells will include pendingUpgrade, filter them out
        const knownSpells =
          spellbook.knownSpells[level]?.filter((s) => !spells.includes(s.id)) || [];
        const availableSpells = spellbook.classSpells[level].filter(
          (s) => !knownSpells.includes(s)
        );

        return (
          <Box mb="4">
            <Text
              fontSize="md"
              bgColor="gray.50"
              borderTop="1px"
              borderBottom="1px"
              borderColor="gray.200"
              px="2"
              py="1"
              mb="2"
            >
              {level} 环法术, 每日{perday}个
            </Text>
            <Box mb="4">
              {availableSpells.length > 0 ? (
                <>
                  <EntityPickerPopover
                    text={`选择新法术(${createOrUpgrade.upgrade.spells.length}/${spellbook.wizardNewSpellSlots})`}
                    entities={availableSpells}
                    items={spells}
                    onPick={
                      createOrUpgrade.upgrade.spells.length < spellbook.wizardNewSpellSlots
                        ? onPick
                        : undefined
                    }
                    onUnpick={onUnpick}
                    listAll
                  />
                  <SimpleGrid columns={[1, 3]} spacing="2" mt="2" mb="4">
                    {spells.map((s) => (
                      <SimpleEntity key={s} entity={collections.spell.getById(s)} />
                    ))}
                  </SimpleGrid>
                </>
              ) : null}
              {knownSpells?.length ? (
                <>
                  <Heading as="h5" fontSize="lg" mb="2" pl="2">
                    已知法术
                  </Heading>
                  <SimpleGrid columns={[1, 3]} spacing="2" mb="4">
                    {knownSpells?.map((s) => (
                      <SimpleEntity key={s.id} entity={s} />
                    ))}
                  </SimpleGrid>
                </>
              ) : null}
            </Box>
          </Box>
        );
      }}
    </Observer>
  );
}

interface Props {
  createOrUpgrade: CreateCharacterStore;
}

export default function CreateOrUpgradeCharacterSpell({ createOrUpgrade }: Props): JSX.Element {
  return (
    <Observer>
      {() => {
        const { spellbook } = createOrUpgrade;

        if (!spellbook) return <Box>此职业目前无法施法</Box>;

        let child = null;

        switch (spellbook.castingType) {
          case 'wizard-like': {
            child = spellbook.spellsPerDay.map((perday, level) => {
              if (perday > 0) {
                return (
                  <SpellsForLevel
                    key={level}
                    createOrUpgrade={createOrUpgrade}
                    spellbook={spellbook}
                    level={level}
                    perday={perday}
                  />
                );
              }

              return null;
            });
          }
        }

        return <>{child}</>;
      }}
    </Observer>
  );
}
