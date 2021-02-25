import { useMemo, useState, MutableRefObject } from 'react';
import { Box, InputGroup, Input, InputLeftElement, Icon, Text, HStack } from '@chakra-ui/react';
import { FaSearch, FaCheck } from 'react-icons/fa';

import { Collection } from '../store/collection';

interface Props {
  collection: Collection;
  onPick: (id: string) => void;
  items: Array<string>;
  inputRef?: MutableRefObject<HTMLInputElement | null>;
}

export default function CollectionEntityPicker({
  collection,
  inputRef,
  onPick,
  items,
}: Props): JSX.Element {
  const [searchKey, setSearchKey] = useState('');
  const searchResult = useMemo(() => {
    return collection?.fuse.search(searchKey) || [];
  }, [searchKey]);

  return (
    <Box>
      <InputGroup>
        <InputLeftElement>
          <Icon as={FaSearch} color="gray.400" />
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
          {searchResult.map(({ item }) => {
            const picked = items.includes(item.id);

            return (
              <HStack
                key={item.id}
                onClick={() => {
                  if (!picked) onPick(item.id);
                }}
                p="2"
                borderBottom="1px"
                borderColor="gray.200"
                _hover={{
                  background: 'gray.100',
                }}
                color={picked ? 'gray.400' : 'black'}
                cursor={picked ? 'not-allowed' : 'pointer'}
              >
                {picked ? <Icon as={FaCheck} /> : null}
                <Text>
                  {item.name} ({item.id})
                </Text>
              </HStack>
            );
          })}
        </Box>
      ) : null}
    </Box>
  );
}
