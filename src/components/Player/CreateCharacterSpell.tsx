import { without } from 'lodash-es';
import { useCallback } from 'react';
import { Observer } from 'mobx-react-lite';
import { Box, Flex, SimpleGrid, Text } from '@chakra-ui/react';

import { useCreateCharacterStore } from '../../store/createCharacter';
import Spellbook from '../../store/spellbook';
import { useStore } from '../../store';

import SimpleEntity from '../SimpleEntity';
import { EntityPickerPopover } from '../EntityPicker';

interface SpellsForLevelProps {
  spellbook: Spellbook;
  level: number;
  perday: number;
}

function SpellsForLevel({ spellbook, level, perday }: SpellsForLevelProps) {
  const { collections } = useStore();
  const create = useCreateCharacterStore();

  const onPick = useCallback((v) => {
    create.upgrade.spells.push(v);
  }, []);
  const onUnpick = useCallback((v) => {
    create.upgrade.spells = without(create.upgrade.spells, v);
  }, []);

  return (
    <Observer>
      {() => {
        const spells = create.upgrade.spells.filter(
          (s) => collections.spell.getSpellLevelForClass(s, create.upgrade.classId) === level
        );
        const knownSpells = spellbook.knownSpells[level] || [];
        const availableSpells = spellbook.classSpells[level].filter(
          (s) => !knownSpells.includes(s)
        );

        return (
          <Box mb="4">
            <Flex
              fontSize="md"
              bgColor="gray.50"
              borderTop="1px"
              borderBottom="1px"
              borderColor="gray.200"
              px="2"
              py="1"
              mb="2"
            >
              <Text>
                {level} 环法术, 每日{perday}个
              </Text>
            </Flex>
            <Box mb="4">
              {availableSpells.length > 0 ? (
                <>
                  <EntityPickerPopover
                    text={`选择新法术(${spells.length}/${spellbook.wizardNewSpellSlots})`}
                    entities={availableSpells}
                    items={spells}
                    onPick={spells.length < spellbook.wizardNewSpellSlots ? onPick : undefined}
                    onUnpick={onUnpick}
                    listAll
                  />
                  <SimpleGrid columns={[1, 3]} spacing="2" mt="2" mb="4">
                    {spells.map((s) => (
                      <SimpleEntity
                        key={s}
                        entity={collections.spell.getById(s)}
                        entityType="spell"
                      />
                    ))}
                  </SimpleGrid>
                </>
              ) : null}
              <SimpleGrid columns={[1, 3]} spacing="2" mb="4">
                {knownSpells?.map((s) => (
                  <SimpleEntity key={s.id} entity={s} entityType="spell" />
                ))}
              </SimpleGrid>
            </Box>
          </Box>
        );
      }}
    </Observer>
  );
}

export default function CreateCharacterSpell(): JSX.Element {
  const create = useCreateCharacterStore();

  return (
    <Observer>
      {() => {
        const { spellbook } = create;

        if (!spellbook) return <Box>此职业目前无法施法</Box>;

        let child = null;

        switch (spellbook.castingType) {
          case 'wizard-like': {
            child = spellbook.spellsPerDay.map((perday, level) => {
              if (perday > 0) {
                return (
                  <SpellsForLevel key={level} spellbook={spellbook} level={level} perday={perday} />
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
