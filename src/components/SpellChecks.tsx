import { without } from 'lodash-es';
import { SimpleGrid, HStack, Spacer, Checkbox } from '@chakra-ui/react';

import { Spell as SpellEntity } from '../types/core';

import Spell from './Spell';
import { EntityQuickViewerToggler } from './EntityQuickViewer';
import { memo, useCallback } from 'react';

function SpellCheck({
  checked,
  spell,
  onChange,
  quickViewer,
  disabled,
}: {
  spell: SpellEntity;
  checked: boolean;
  onChange: (id: string, checked: boolean) => void;
  quickViewer?: boolean;
  disabled?: boolean;
}) {
  console.count('item');

  return (
    <HStack
      border="1px"
      borderColor="gray.200"
      p="2"
      borderRadius="md"
      minW="64"
      onClick={() => {
        onChange(spell.id, !checked);
      }}
      cursor={disabled ? 'not-allowed' : 'pointer'}
      _hover={{
        boxShadow: 'md',
      }}
    >
      <Checkbox isChecked={checked} isDisabled={disabled} />
      <Spell spell={spell} showDescription={false} showMeta={false} />
      <Spacer />
      {quickViewer ? <EntityQuickViewerToggler entity={spell} kind="spell" /> : null}
    </HStack>
  );
}

export const MemorizedSpellCheck = memo(SpellCheck);

interface Props {
  spells: SpellEntity[];
  knownSpells?: SpellEntity[];
  value: string[];
  onPick: (id: string) => void;
  onUnpick: (id: string) => void;
  quickViewer?: boolean;
  disabled?: boolean;
}

export default function SpellChecks({
  spells,
  knownSpells,
  value,
  onPick,
  onUnpick,
  quickViewer = true,
  disabled = false,
}: Props): JSX.Element {
  const onSpellCheck = useCallback(
    (id: string, checked: boolean) => {
      if (checked) {
        onPick(id);
      } else {
        onUnpick(id);
      }
    },
    [onPick, onUnpick]
  );

  return (
    <SimpleGrid columns={[1, 3]} spacing="2" mb="4">
      {spells.map((s) => {
        const checked = value.includes(s.id) || Boolean(knownSpells?.includes(s));
        const itemDisabled = disabled || Boolean(knownSpells?.includes(s));

        return (
          <MemorizedSpellCheck
            key={s.id}
            checked={checked}
            spell={s}
            onChange={onSpellCheck}
            quickViewer={quickViewer}
            disabled={itemDisabled}
          />
        );
      })}
    </SimpleGrid>
  );
}
