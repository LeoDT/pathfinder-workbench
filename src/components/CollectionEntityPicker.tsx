import { useMemo, useState, MutableRefObject } from 'react';
import { Box, InputGroup, Input, InputLeftElement } from '@chakra-ui/react';
import { Search2Icon } from '@chakra-ui/icons';

import { useStore } from '../store';
import { CollectionEntityType } from '../store/collection';
import { Entity } from '../store/types';

interface Props {
  collectionEntityType: CollectionEntityType;
  onPick: (entity: Entity) => void;
  inputRef?: MutableRefObject<HTMLInputElement | null>;
}

export default function CollectionEntityPicker({
  collectionEntityType,
  inputRef,
  onPick,
}: Props): JSX.Element {
  const store = useStore();
  const [searchKey, setSearchKey] = useState('');
  const searchResult = useMemo(() => {
    const collection = store.collections.find((c) => c.type === collectionEntityType);

    return collection?.fuse.search(searchKey) || [];
  }, [searchKey]);

  return (
    <Box>
      <InputGroup>
        <InputLeftElement>
          <Search2Icon color="gray.400" />
        </InputLeftElement>
        <Input
          ref={inputRef}
          placeholder="Search"
          autoFocus
          value={searchKey}
          onChange={(e) => {
            setSearchKey(e.target.value);
          }}
        />
      </InputGroup>
      {searchResult.length > 0 ? (
        <Box borderTop="1px" borderColor="gray.100" mt="2" maxH={300} overflow="auto">
          {searchResult.map(({ item }) => (
            <Box
              key={item.id}
              onClick={() => onPick(item)}
              p="2"
              borderBottom="1px"
              borderColor="gray.200"
              cursor="pointer"
              _hover={{
                background: 'gray.100',
              }}
            >
              {item.name} ({item.id})
            </Box>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}
