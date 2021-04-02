import { useMemo, useState, MutableRefObject, useRef } from 'react';
import Fuse from 'fuse.js';

import {
  Box,
  Button,
  InputGroup,
  Input,
  InputLeftElement,
  InputRightElement,
  Icon,
  Text,
  HStack,
  Spacer,
  PopoverTrigger,
  Popover,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  useDisclosure,
} from '@chakra-ui/react';
import { FaSearch, FaCheck, FaTimesCircle } from 'react-icons/fa';

import { Entity } from '../types/core';

import { EntityQuickViewerToggler } from './EntityQuickViewer';

export interface Props {
  fuse?: Fuse<Entity>;
  onPick?: (id: string) => void;
  onUnpick?: (id: string) => void;
  items?: Array<string>;
  inputRef?: MutableRefObject<HTMLInputElement | null>;
  quickViewer?: boolean;
  entities?: Array<Entity>;
  listAll?: boolean;
}

export default function EntityPicker({
  inputRef,
  onPick,
  onUnpick,
  items,
  quickViewer = true,
  fuse,
  entities,
  listAll = false,
}: Props): JSX.Element {
  const [searchKey, setSearchKey] = useState('');
  const realFuse = useMemo(() => {
    if (fuse) return fuse;

    if (entities)
      return new Fuse(entities, {
        includeScore: true,
        threshold: 0.2,
        keys: ['id', 'name'],
      });

    return new Fuse([]);
  }, [fuse, entities]);
  const searchResult = useMemo(() => {
    return realFuse.search(searchKey) || [];
  }, [realFuse, searchKey]);
  const results = useMemo(() => {
    if (listAll && entities && !searchKey) {
      return entities;
    }

    return searchResult.map((r) => r.item);
  }, [searchKey, searchResult, entities, listAll]);

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
        {searchKey ? (
          <InputRightElement>
            <Icon
              as={FaTimesCircle}
              color="gray.400"
              cursor="pointer"
              _hover={{ color: 'gray.600' }}
              onClick={() => setSearchKey('')}
            />
          </InputRightElement>
        ) : null}
      </InputGroup>
      {results.length > 0 ? (
        <Box borderTop="1px" borderColor="gray.100" mt="2" maxH={300} overflow="auto">
          {results.map((item) => {
            const picked = items?.includes(item.id);
            const disabled = (!onUnpick && picked) || (!onPick && !picked);

            return (
              <HStack
                key={item.id}
                onClick={() => {
                  if (picked) {
                    if (onUnpick) {
                      onUnpick(item.id);
                    }
                  } else if (onPick) {
                    onPick(item.id);
                  }
                }}
                p="2"
                borderBottom="1px"
                borderColor="gray.200"
                _hover={{
                  background: 'gray.100',
                }}
                opacity={disabled ? 0.6 : 1}
                cursor={disabled ? 'not-allowed' : 'pointer'}
              >
                {picked ? <Icon as={FaCheck} /> : null}
                <Text>
                  {item.name} ({item.id})
                </Text>
                <Spacer />
                {quickViewer ? <EntityQuickViewerToggler entity={item} /> : null}
              </HStack>
            );
          })}
        </Box>
      ) : null}
    </Box>
  );
}

export interface PopoverProps extends Props {
  text: string;
  togglerDisabled?: boolean;
}

export function EntityPickerPopover({
  text,
  togglerDisabled,
  ...props
}: PopoverProps): JSX.Element {
  const { isOpen, onClose, onToggle } = useDisclosure();
  const initialFocusRef = useRef<HTMLInputElement>(null);

  return (
    <Popover
      initialFocusRef={initialFocusRef}
      placement="bottom-start"
      isOpen={isOpen}
      onClose={onClose}
    >
      <PopoverTrigger>
        <Button disabled={togglerDisabled} onClick={onToggle}>
          {text}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverBody>
          <EntityPicker inputRef={initialFocusRef} {...props} />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
