import { without } from 'lodash-es';
import { Observer } from 'mobx-react-lite';
import { useCallback } from 'react';

import { Box, Heading, SimpleGrid, Text } from '@chakra-ui/react';

import { useStore } from '../../store';
import { CharacterSpellbook } from '../../store/character/spellbook';
import CreateCharacterStore from '../../store/createCharacter';
import { EntityPickerPopover } from '../EntityPicker';
import SimpleEntity from '../SimpleEntity';

interface SpellsForLevelProps {
  spellbook: CharacterSpellbook;
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
          (s) => spellbook.getSpellLevel(s) === level
        );
        // knownSpells will include pendingUpgrade, filter them out
        const knownSpells =
          spellbook.knownSpells[level]?.filter((s) => !spells.includes(s.id)) || [];
        const availableSpells = spellbook.classSpells[level].filter(
          (s) => !knownSpells.includes(s)
        );

        const pickerProps: {
          text: string;
          onPick?: (v: string) => void;
        } = {
          text: '',
        };

        switch (spellbook.castingType) {
          case 'wizard-like': {
            pickerProps.text = `选择新法术(${createOrUpgrade.upgrade.spells.length}/${spellbook.wizardNewSpellSlots})`;
            pickerProps.onPick =
              createOrUpgrade.upgrade.spells.length < spellbook.wizardNewSpellSlots
                ? onPick
                : undefined;
            break;
          }

          case 'sorcerer-like': {
            const slots = spellbook.getSorcererNewSpellSlotsForLevel(level);

            pickerProps.text = `选择新法术(${spells.length}/${slots})`;
            pickerProps.onPick = spells.length < slots ? onPick : undefined;
            break;
          }
        }

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
              {level} 环法术{perday === 0 && level === 0 ? '' : `, 每日${perday}个`}
            </Text>
            <Box mb="4">
              {availableSpells.length > 0 ? (
                <>
                  {pickerProps.text ? (
                    <EntityPickerPopover
                      text={pickerProps.text}
                      entities={availableSpells}
                      items={spells}
                      onPick={pickerProps.onPick}
                      onUnpick={onUnpick}
                      listAll
                    />
                  ) : null}
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

        const child = spellbook.spellsPerDay.map((perday, level) => {
          if (perday > 0 || (perday === 0 && level === 0)) {
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

        return <>{child}</>;
      }}
    </Observer>
  );
}
