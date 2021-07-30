import Fuse from 'fuse.js';
import { MutableRefObject, ReactNode, RefObject, useMemo, useRef, useState } from 'react';
import { FaCheck, FaChevronDown, FaSearch, FaTimesCircle } from 'react-icons/fa';

import {
  Box,
  Button,
  ButtonProps,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Spacer,
  Text,
  useDisclosure,
} from '@chakra-ui/react';

import { Entity } from '../types/core';
import { createContextFailSafe } from '../utils/react';
import { EntityQuickViewerToggler } from './EntityQuickViewer';
import { spellAsLabelRenderer } from './Spell';

export interface Props<T extends Entity> {
  fuse?: Fuse<T>;
  onPick?: (id: string) => void;
  afterPick?: () => void;
  onUnpick?: (id: string) => void;
  items?: Array<string>;
  inputRef?: MutableRefObject<HTMLInputElement | null>;
  quickViewer?: boolean;
  entities?: Array<T>;
  disabledEntityIds?: string[];
  listAll?: boolean;
  labelRenderer?: (e: T) => ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const labelRenderers: Record<string, (...args: any) => ReactNode> = {
  spell: spellAsLabelRenderer,
};

export function EntityPicker<T extends Entity>({
  inputRef,
  onPick,
  afterPick,
  onUnpick,
  items,
  quickViewer = true,
  fuse,
  entities,
  disabledEntityIds,
  listAll = false,
  labelRenderer,
}: Props<T>): JSX.Element {
  const inputRefFromContext = useEntityPickerInputRef();
  const realInputRef = inputRef || inputRefFromContext;
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
  const results: T[] = useMemo(() => {
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
          ref={realInputRef}
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
            const disabled =
              (!onUnpick && picked) ||
              (!onPick && !picked) ||
              Boolean(disabledEntityIds?.includes(item.id));

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

                    if (afterPick) {
                      afterPick();
                    }
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

                {labelRenderer ? (
                  labelRenderer(item)
                ) : labelRenderers[item._type] ? (
                  labelRenderers[item._type](item)
                ) : (
                  <Text>{item.name || item.id}</Text>
                )}

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

export interface PopoverProps<T extends Entity> extends Props<T> {
  text: string;
  textWithArrow?: boolean;
  togglerDisabled?: boolean;
  closeOnPick?: boolean;
  togglerBtnProps?: ButtonProps;
}

export function EntityPickerPopover<T extends Entity>({
  text,
  textWithArrow,
  togglerDisabled,
  closeOnPick,
  togglerBtnProps,
  ...props
}: PopoverProps<T>): JSX.Element {
  const { isOpen, onClose, onToggle } = useDisclosure();
  const initialFocusRef = useRef<HTMLInputElement>(null);
  return (
    <Popover
      initialFocusRef={initialFocusRef}
      placement="bottom-start"
      isOpen={isOpen}
      onClose={onClose}
      isLazy
    >
      <PopoverTrigger>
        <Button disabled={togglerDisabled} onClick={onToggle} {...togglerBtnProps}>
          <HStack>
            {typeof text === 'string' ? <Text>{text}</Text> : text}
            {textWithArrow ? <Icon as={FaChevronDown} display="inine-block" /> : null}
          </HStack>
        </Button>
      </PopoverTrigger>
      <PopoverContent zIndex="tooltip">
        <PopoverArrow />
        <PopoverBody>
          <EntityPicker
            inputRef={initialFocusRef}
            afterPick={() => {
              if (closeOnPick) {
                onClose();
              }
            }}
            {...props}
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

export const [useEntityPickerInputRef, EntityPickerInputRefContext] =
  createContextFailSafe<RefObject<HTMLInputElement>>();
