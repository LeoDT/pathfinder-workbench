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

import CollectionEntityPicker from '../CollectionEntityPicker';

import { useStore } from '../../store';
import { Spell as SpellType } from '../../store/types';
import { useCurrentCharacter } from '../../store/character';
import { useIsSmallerScreen } from '../../utils/react';

import Spell from '../Spell';

export default function CharacterSpellbook(): JSX.Element {
  const store = useStore();
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const character = useCurrentCharacter();
  const [showSpell, setShowSpell] = useState<SpellType | null>();
  const isSmallerScreen = useIsSmallerScreen();

  return (
    <>
      <Popover initialFocusRef={initialFocusRef} placement="bottom-start">
        <PopoverTrigger>
          <Button size="sm">添加法术</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverBody>
            <PopoverArrow />
            <Observer>
              {() => (
                <CollectionEntityPicker
                  collection={store.collections.spell}
                  inputRef={initialFocusRef}
                  onPick={(id) => {
                    character.spellbookIds.add(id);
                  }}
                  items={Array.from(character.spellbookIds)}
                />
              )}
            </Observer>
          </PopoverBody>
        </PopoverContent>
      </Popover>
      <Divider my="2" />
      <Observer>
        {() => (
          <SimpleGrid columns={isSmallerScreen ? 1 : 3} spacing="2">
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
                      character.spellbookIds.delete(spell.id);
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
