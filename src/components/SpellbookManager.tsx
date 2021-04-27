import { Observer } from 'mobx-react-lite';

import {
  Box,
  Button,
  ButtonProps,
  Modal,
  ModalBody,
  ModalHeader,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  SimpleGrid,
  Text,
  useDisclosure,
  IconButton,
  Icon,
} from '@chakra-ui/react';
import { FaTrash } from 'react-icons/fa';

import { CharacterSpellbook } from '../store/character/spellbook';
import { EntityPickerPopover } from './EntityPicker';
import SimpleEntity from './SimpleEntity';
import { collections } from '../store/collection';

interface ManagerProps {
  spellbook: CharacterSpellbook;
}

export function SpellbookManager({ spellbook }: ManagerProps): JSX.Element {
  return (
    <Observer>
      {() => {
        const preparedSpellIds = spellbook.preparedSpellIds ?? [];
        const preparedSpecialSpellIds = spellbook.preparedSpecialSpellIds ?? [];

        return (
          <Box>
            {spellbook.spellsPerDay.map((perDay, i) => {
              const preparedSpellsForLevel = spellbook.preparedSpells[i] ?? [];
              const preparedSpecialSpellsForLevel = spellbook.preparedSpecialSpells[i] ?? [];
              const spellsKnownForLevel = spellbook.knownSpells[i] ?? [];
              const speicalSpellsKnownForLevel = spellbook.knownSpecialSpells[i] ?? [];
              const spellDuplicatable = spellbook.castingType === 'wizard-like' && i > 0;
              const specialSlot = i > 0 ? spellbook.arcaneSchoolPrepareSlot?.amount ?? 0 : 0;
              const slotUsage = preparedSpellsForLevel
                .map((s) => spellbook.getSlotUsageForSpell(s))
                .reduce((acc, s) => acc + s, 0);

              if (perDay <= 0) return null;

              return (
                <Box key={i} _notLast={{ mb: '2' }}>
                  <Text
                    fontSize="md"
                    bgColor="gray.50"
                    borderTop="1px"
                    borderBottom="1px"
                    borderColor="gray.200"
                    px="2"
                    py="1"
                    mb="2"
                  >
                    {i} 环 {slotUsage}/{perDay} 个法术位
                    {specialSlot > 0 ? ` ${specialSlot}额外法术位` : ''}
                  </Text>
                  <SimpleGrid columns={[1, 3]} spacing="2" pb="2">
                    {preparedSpellsForLevel.map((s, i) => (
                      <SimpleEntity
                        key={`${s.id}:${i}`}
                        entity={s}
                        addon={
                          spellDuplicatable ? (
                            <IconButton
                              height="auto"
                              size="sm"
                              colorScheme="red"
                              borderLeftRadius="0"
                              aria-label="Unprepare spell"
                              icon={<Icon as={FaTrash} />}
                              onClick={() => {
                                spellbook.unprepareSpell(s);
                              }}
                            />
                          ) : null
                        }
                      />
                    ))}
                  </SimpleGrid>
                  <EntityPickerPopover
                    text="选择法术"
                    entities={spellsKnownForLevel}
                    items={spellDuplicatable ? undefined : preparedSpellIds}
                    disabledEntityIds={spellsKnownForLevel
                      .filter(
                        (s) =>
                          !preparedSpellIds.includes(s.id) &&
                          spellbook.getSlotUsageForSpell(s) + slotUsage > perDay
                      )
                      .map((s) => s.id)}
                    onPick={
                      slotUsage >= perDay
                        ? undefined
                        : (s: string) => {
                            spellbook.prepareSpell(collections.spell.getById(s));
                          }
                    }
                    onUnpick={(s: string) => {
                      spellbook.unprepareSpell(collections.spell.getById(s));
                    }}
                    listAll
                  />

                  {specialSlot > 0 ? (
                    <>
                      <SimpleGrid columns={[1, 3]} spacing="2" py="2">
                        {preparedSpecialSpellsForLevel.map((s, i) => (
                          <SimpleEntity key={`${s.id}:${i}`} entity={s} />
                        ))}
                      </SimpleGrid>
                      <EntityPickerPopover
                        text="选择额外法术"
                        entities={speicalSpellsKnownForLevel}
                        items={preparedSpecialSpellIds}
                        onPick={
                          preparedSpecialSpellsForLevel.length >= specialSlot
                            ? undefined
                            : (s: string) => {
                                spellbook.prepareSpecialSpell(collections.spell.getById(s));
                              }
                        }
                        onUnpick={(s: string) => {
                          spellbook.unprepareSpecialSpell(collections.spell.getById(s));
                        }}
                        listAll
                      />
                    </>
                  ) : null}
                </Box>
              );
            })}
          </Box>
        );
      }}
    </Observer>
  );
}

interface TogglerProps extends ManagerProps {
  buttonProps?: ButtonProps;
}

export function SpellbookManagerToggler({ spellbook, buttonProps }: TogglerProps): JSX.Element {
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <Button {...buttonProps} onClick={() => onOpen()}>
        准备法术
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>准备法术</ModalHeader>
          <ModalBody>{isOpen ? <SpellbookManager spellbook={spellbook} /> : null}</ModalBody>
          <ModalFooter>
            <Button onClick={() => onClose()}>OK</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
