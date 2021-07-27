import { autorun } from 'mobx';
import { Observer } from 'mobx-react-lite';
import { useCallback, useEffect, useState } from 'react';

import { Box, Button, HStack, Tag, Text, Wrap, WrapItem } from '@chakra-ui/react';

import { ENTITY_COLOR_SCHEME } from '../../constant';
import { useStore } from '../../store';
import { CharacterSpellbook } from '../../store/character/spellbook';
import { Spell } from '../../types/core';
import { SpellbookManagerToggler } from '../SpellbookManager';
import { useCurrentCharacter } from './context';

interface Props {
  spellbook: CharacterSpellbook;
}

export function CharacterDetailSpells({ spellbook }: Props): JSX.Element {
  const { collections } = useStore();
  const character = useCurrentCharacter();
  const [spellTrackers, setSpellTrackers] = useState<Map<Spell, number>>(() => {
    return new Map();
  });
  const [spellsByLevel, setSpellsByLevel] = useState<Spell[][]>([]);
  const calculateSpells = useCallback(() => {
    const { tracker } = character;
    const casted = tracker.spellTracker.get(spellbook.class.id) ?? [];
    const result = new Map<Spell, number>();

    switch (spellbook.castingType) {
      case 'wizard-like':
        {
          const preparedSpells = collections.spell.getByIds([
            ...spellbook.preparedSpellIds,
            ...spellbook.preparedSpecialSpellIds,
          ]);

          for (const spell of preparedSpells) {
            const level = spellbook.getSpellLevel(spell);

            if (level === 0) {
              result.set(spell, -1);
            } else {
              result.set(spell, (result.get(spell) ?? 0) + 1);
            }
          }

          for (const c of casted) {
            const cs = collections.spell.getById(c);
            const remain = result.get(cs);

            if (!remain) continue;

            result.set(cs, remain - 1);
          }
        }
        break;

      case 'sorcerer-like':
        {
          spellbook.knownSpells.forEach((spells, level) => {
            const perday = spellbook.spellsPerDay[level];
            const castedByLevel: number[] = [];

            for (const c of casted) {
              const level = spellbook.getSpellLevel(c);

              if (!castedByLevel[level]) {
                castedByLevel[level] = 0;
              }

              castedByLevel[level] += 1;
            }

            spells.forEach((s) => {
              const level = spellbook.getSpellLevel(s);

              if (level === 0) {
                result.set(s, -1);
              } else {
                result.set(s, perday - (castedByLevel[level] ?? 0));
              }
            });
          });
        }

        break;

      case 'cleric-like':
        {
          const preparedSpells = collections.spell.getByIds([
            ...spellbook.preparedSpellIds,
            ...spellbook.preparedSpecialSpellIds,
          ]);
          const castedByLevel: number[] = [];

          for (const c of casted) {
            const level = spellbook.getSpellLevel(c);

            if (!castedByLevel[level]) {
              castedByLevel[level] = 0;
            }

            castedByLevel[level] += 1;
          }

          for (const spell of preparedSpells) {
            const level = spellbook.getSpellLevel(spell);
            const perday = spellbook.spellsPerDay[level];

            if (level === 0) {
              result.set(spell, -1);
            } else {
              result.set(spell, perday - (castedByLevel[level] ?? 0));
            }
          }
        }
        break;

      default:
        break;
    }

    setSpellTrackers(result);
    setSpellsByLevel(spellbook.partitionSpellsByLevel(Array.from(result.keys())));
  }, []);

  useEffect(() => {
    const dispose = autorun(() => {
      calculateSpells();
    });

    return () => {
      dispose();
    };
  }, []);

  return (
    <Box position="relative">
      <HStack position="absolute" right="0" top="-9">
        <Button
          size="sm"
          onClick={() => {
            character.tracker.resetSpellTracker(spellbook);
          }}
        >
          恢复
        </Button>
        <SpellbookManagerToggler spellbook={spellbook} buttonProps={{ size: 'sm' }} />
      </HStack>

      <Observer>
        {() =>
          spellTrackers.size > 0 ? (
            <>
              {spellsByLevel.map((spells, level) => {
                const dc = 10 + spellbook.abilityModifier + level;

                return (
                  <Box key={level}>
                    <Text
                      fontSize="sm"
                      bgColor="gray.50"
                      borderTop="1px"
                      borderBottom="1px"
                      borderColor="gray.200"
                      px="2"
                      mb="2"
                    >
                      {level} 环法术, DC{dc}
                    </Text>
                    <Wrap mb="2">
                      {spells.map((spell) => {
                        const remain = spellTrackers.get(spell) || -1;
                        const disabled = remain === 0;
                        const spellDC = spellbook.getDifficultyClass(spell);
                        console.log(spellDC);

                        return (
                          <WrapItem key={spell.id}>
                            <Tag
                              colorScheme={ENTITY_COLOR_SCHEME.spell}
                              variant="outline"
                              cursor={disabled ? 'not-allowed' : 'pointer'}
                              opacity={disabled ? 0.4 : 1}
                              _hover={disabled ? {} : { opacity: 0.8 }}
                              onClick={() => {
                                if (remain > 0) {
                                  character.tracker.castSpell(spellbook, spell);
                                }
                              }}
                            >
                              {spell.name}
                              {spellDC !== dc ? `(DC${spellDC})` : ''} &times;{' '}
                              {remain < 0 ? '∞' : remain}
                            </Tag>
                          </WrapItem>
                        );
                      })}
                    </Wrap>
                  </Box>
                );
              })}
            </>
          ) : (
            <Text color="grey">毫无准备</Text>
          )
        }
      </Observer>
    </Box>
  );
}
