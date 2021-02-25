import { useMemo, useState } from 'react';
import {
  Box,
  InputGroup,
  Input,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Button,
  Tag,
  HStack,
} from '@chakra-ui/react';
import { Search2Icon, ChevronDownIcon } from '@chakra-ui/icons';

import { ENTITY_COLORS } from '../constant';
import { useStore } from '../store';
import { CollectionEntityType } from '../store/collection';
import { Entity, Spell as SpellType, Feat as FeatType } from '../store/types';
import { useIsSmallerScreen } from '../utils/react';
import { entityTypeTranslates } from '../utils/entity';
import Spell from './Spell';
import Feat from './Feat';

function QuickSearchResultItem({ item, type }: { item: Entity; type: CollectionEntityType }) {
  let el = null;

  switch (type) {
    case 'spell':
      el = <Spell spell={item as SpellType} />;
      break;
    case 'feat':
      el = <Feat feat={item as FeatType} />;
      break;
    default:
      break;
  }

  return (
    <Box
      mb="2"
      border="1px"
      borderColor="gray.200"
      p="2"
      borderRadius="md"
      _hover={{
        borderColor: 'gray.300',
        boxShadow: 'base',
      }}
      transition="all .2s ease-in-out"
    >
      {el}
    </Box>
  );
}

export default function QuickSearch(): JSX.Element {
  const store = useStore();
  const [searchKey, setSearchKey] = useState('');
  const searchResult = useMemo(() => store.quickSearch(searchKey), [searchKey]);
  const [currentType, setCurrentType] = useState(() => searchResult?.[0]?.[0]);
  const isSmallerScreen = useIsSmallerScreen();
  const [resultType, results] = searchResult.find(([t]) => currentType === t) || [];

  return (
    <>
      <Box flexGrow={0} flexShrink={0} mb="2">
        <InputGroup>
          <InputLeftElement>
            <Search2Icon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="计划是搜一切"
            autoFocus
            value={searchKey}
            onChange={(e) => {
              setSearchKey(e.target.value);
            }}
          />
        </InputGroup>
        {results && results?.length > 0 ? (
          isSmallerScreen ? (
            <Menu matchWidth autoSelect={false}>
              <MenuButton
                mt="2"
                as={Button}
                rightIcon={<ChevronDownIcon />}
                variant="outline"
                width="100%"
                colorScheme="blackAlpha"
              >
                {entityTypeTranslates[currentType]}
              </MenuButton>
              <MenuList>
                {searchResult.map(([type, r]) =>
                  r.length > 0 ? (
                    <MenuItem
                      key={type}
                      onClick={() => {
                        setCurrentType(type);
                      }}
                    >
                      {entityTypeTranslates[type]}
                    </MenuItem>
                  ) : null
                )}
              </MenuList>
            </Menu>
          ) : (
            <HStack pt="2">
              {searchResult.map(([type, r]) =>
                r.length > 0 ? (
                  <Tag
                    key={type}
                    onClick={() => setCurrentType(type)}
                    bgColor={ENTITY_COLORS[type]}
                    color="white"
                    cursor="pointer"
                    size="lg"
                    opacity={type === currentType ? 1 : 0.6}
                  >
                    {entityTypeTranslates[type]}({r.length})
                  </Tag>
                ) : null
              )}
            </HStack>
          )
        ) : null}
      </Box>
      {results && resultType && results?.length > 0 ? (
        <Box flexGrow={1} overflowY="auto" key={resultType}>
          {results.map(({ item }) => (
            <QuickSearchResultItem key={item.id} type={resultType} item={item} />
          ))}
        </Box>
      ) : null}
    </>
  );
}
