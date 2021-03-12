import { useMemo, useState, MutableRefObject, useRef, useEffect } from 'react';
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
  PopoverTrigger,
  Popover,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  useDisclosure,
} from '@chakra-ui/react';
import { FaSearch, FaCheck, FaTimesCircle } from 'react-icons/fa';

import { Collection } from '../store/collection';

import { EntityQuickViewerToggler } from './EntityQuickViewer';

interface Props {
  collection: Collection;
  onPick: (id: string) => void;
  onUnpick?: (id: string) => void;
  items?: Array<string>;
  inputRef?: MutableRefObject<HTMLInputElement | null>;
  quickViewer?: boolean;
}

export default function CollectionEntityPicker({
  collection,
  inputRef,
  onPick,
  onUnpick,
  items,
  quickViewer = true,
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
      {searchResult.length > 0 ? (
        <Box borderTop="1px" borderColor="gray.100" mt="2" maxH={300} overflow="auto">
          {searchResult.map(({ item }) => {
            const picked = items?.includes(item.id);

            return (
              <HStack
                key={item.id}
                onClick={() => {
                  if (picked) {
                    if (onUnpick) {
                      onUnpick(item.id);
                    }
                  } else {
                    onPick(item.id);
                  }
                }}
                p="2"
                borderBottom="1px"
                borderColor="gray.200"
                _hover={{
                  background: 'gray.100',
                }}
                cursor={!onUnpick && picked ? 'not-allowed' : 'pointer'}
              >
                {picked ? <Icon as={FaCheck} /> : null}
                <Text>
                  {item.name} ({item.id})
                </Text>
                {quickViewer ? (
                  <EntityQuickViewerToggler kind={collection.type} entity={item} />
                ) : null}
              </HStack>
            );
          })}
        </Box>
      ) : null}
    </Box>
  );
}

interface PopoverProps extends Props {
  text: string;
  disabled?: boolean;
}

export function CollectionEntityPickerPopover({
  text,
  disabled,
  ...props
}: PopoverProps): JSX.Element {
  const { isOpen, onClose, onToggle } = useDisclosure();
  const initialFocusRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (disabled) {
      onClose();
    }
  }, [disabled]);

  return (
    <Popover
      initialFocusRef={initialFocusRef}
      placement="bottom-start"
      isOpen={isOpen}
      onClose={onClose}
    >
      <PopoverTrigger>
        <Button disabled={disabled} onClick={onToggle}>
          {text}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverBody>
          <CollectionEntityPicker inputRef={initialFocusRef} {...props} />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
