import {
  Button,
  Flex,
  Spacer,
  Divider,
  SimpleGrid,
  PopoverTrigger,
  Popover,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useRef, useState } from 'react';
import { Observer } from 'mobx-react-lite';

import CollectionEntityPicker from './CollectionEntityPicker';

import { Spell as SpellType } from '../store/types';
import { useCurrentCharacter } from '../store/character';
import Spell from './Spell';

export default function PlayerSpellBook(): JSX.Element {
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const character = useCurrentCharacter();
  const [showSpell, setShowSpell] = useState<SpellType | null>();

  return (
    <>
      <Popover initialFocusRef={initialFocusRef} placement="bottom-start">
        <PopoverTrigger>
          <Button size="sm">Add Spell</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverBody>
            <PopoverArrow />
            <CollectionEntityPicker
              collectionEntityType="spell"
              inputRef={initialFocusRef}
              onPick={(item) => {
                character.spellbook.add(item as SpellType);
              }}
            />
          </PopoverBody>
        </PopoverContent>
      </Popover>
      <Divider m="2" />
      <Observer>
        {() => (
          <SimpleGrid columns={3} spacing="2">
            {Array.from(character.spellbook).map((spell) => (
              <Flex
                key={spell.id}
                cursor="pointer"
                transition="box-shadow 0.2s ease-in-out"
                _hover={{ boxShadow: 'base' }}
                border="1px"
                borderColor="gray.200"
                p="2"
                borderRadius="md"
                onClick={() => setShowSpell(spell)}
                align="center"
              >
                <Spell spell={spell} showMeta={false} showDescription={false} />
                <Spacer />
                <DeleteIcon
                  color="red.500"
                  transition="color 0.2s ease-in-out"
                  _hover={{ color: 'red.600' }}
                  onClick={(e) => {
                    if (confirm('Are you sure?')) {
                      character.spellbook.delete(spell);
                    }
                    e.stopPropagation();
                  }}
                />
              </Flex>
            ))}
          </SimpleGrid>
        )}
      </Observer>

      <Drawer
        isOpen={Boolean(showSpell)}
        onClose={() => {
          setShowSpell(null);
        }}
        size="lg"
      >
        <DrawerOverlay>
          <DrawerContent>
            <DrawerBody>{showSpell ? <Spell spell={showSpell} /> : null}</DrawerBody>
            <DrawerCloseButton />
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </>
  );
}
