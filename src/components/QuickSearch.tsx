import { useEffect, useMemo, useState } from 'react';

import { ChevronDownIcon, Search2Icon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tag,
} from '@chakra-ui/react';

import { ENTITY_COLORS } from '../constant';
import { useStore } from '../store';
import {
  ArmorType as ArmorTypeType,
  Entity,
  Feat as FeatType,
  MagicItemType as MagicItemTypeType,
  Spell as SpellType,
  WeaponType as WeaponTypeType,
} from '../types/core';
import { entityTypeTranslates } from '../utils/entity';
import { useIsSmallerScreen } from '../utils/react';
import { ArmorType } from './ArmorType';
import { Feat } from './Feat';
import { MagicItemType } from './MagicItemType';
import { Spell } from './Spell';
import { WeaponType } from './WeaponType';

function QuickSearchResultItem({ item }: { item: Entity }) {
  let el = null;

  switch (item._type) {
    case 'spell':
      el = <Spell spell={item as SpellType} showId />;
      break;
    case 'feat':
      el = <Feat feat={item as FeatType} showId />;
      break;
    case 'weaponType':
      el = <WeaponType weaponType={item as WeaponTypeType} showId />;
      break;
    case 'armorType':
      el = <ArmorType armorType={item as ArmorTypeType} showId />;
      break;
    case 'magicItemType':
      el = <MagicItemType magicItemType={item as MagicItemTypeType} showId />;
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

export function QuickSearch(): JSX.Element {
  const store = useStore();
  const [searchKey, setSearchKey] = useState('');
  const searchResult = useMemo(() => store.quickSearch(searchKey), [searchKey]);
  const [currentType, setCurrentType] = useState(() => searchResult?.[0]?.[0]);
  const isSmallerScreen = useIsSmallerScreen();
  const [resultType, results] = searchResult.find(([t]) => currentType === t) || [];

  useEffect(() => {
    const hasResult = searchResult.filter(([, r]) => r.length > 0);

    if (!hasResult.map(([t]) => t).includes(currentType)) {
      setCurrentType(hasResult[0]?.[0]);
    }
  }, [currentType, searchResult]);

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
            <Menu matchWidth autoSelect={false} isLazy>
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
            <QuickSearchResultItem key={item.id} item={item} />
          ))}
        </Box>
      ) : null}
    </>
  );
}
