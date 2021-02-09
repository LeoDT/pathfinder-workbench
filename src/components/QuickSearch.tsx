import { useMemo, useState } from 'react';
import { Box, InputGroup, Input, InputLeftElement } from '@chakra-ui/react';
import { Search2Icon } from '@chakra-ui/icons';

import { useStore } from '../store';
import { Spell as SpellType } from '../store/types';
import Spell from './Spell';

export default function QuickSearch(): JSX.Element {
  const store = useStore();
  const [searchKey, setSearchKey] = useState('');
  const searchResult = useMemo(() => store.quickSearch(searchKey), [searchKey]);

  return (
    <>
      <Box flexGrow={0} flexShrink={0} mb="2">
        <InputGroup>
          <InputLeftElement>
            <Search2Icon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search Anything"
            autoFocus
            value={searchKey}
            onChange={(e) => {
              setSearchKey(e.target.value);
            }}
          />
        </InputGroup>
      </Box>
      <Box flexGrow={1} overflowY="auto">
        {searchResult.spell.map(({ item }) => (
          <Spell spell={item as SpellType} key={item.id} />
        ))}
      </Box>
    </>
  );
}
