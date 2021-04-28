import { autorun } from 'mobx';
import { Observer } from 'mobx-react-lite';
import { useCallback, useEffect, useState } from 'react';

import { Box, HStack, Tag, Wrap, WrapItem, Button, Text } from '@chakra-ui/react';

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
  const [spells, setSpells] = useState<Map<Spell, number>>(() => {
    return new Map();
  });
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
            const level = collections.spell.getSpellLevelForClass(spell, spellbook.class);

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

      default:
        break;
    }

    setSpells(result);
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
          spells.size > 0 ? (
            <Wrap>
              {Array.from(spells.entries()).map(([spell, remain]) => {
                const disabled = remain === 0;

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
                      {spell.name} &times; {remain < 0 ? '∞' : remain}
                    </Tag>
                  </WrapItem>
                );
              })}
            </Wrap>
          ) : (
            <Text color="grey">毫无准备</Text>
          )
        }
      </Observer>
    </Box>
  );
}
