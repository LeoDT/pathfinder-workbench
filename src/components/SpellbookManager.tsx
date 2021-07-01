import { Observer } from 'mobx-react-lite';
import { FaTrash } from 'react-icons/fa';

import {
  Box,
  Button,
  ButtonProps,
  Icon,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  SimpleGrid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
} from '@chakra-ui/react';

import { CharacterSpellbook } from '../store/character/spellbook';
import { collections } from '../store/collection';
import { schoolTranslates } from '../utils/spell';
import { EntityPickerPopover } from './EntityPicker';
import { SimpleEntity } from './SimpleEntity';

interface ManagerProps {
  spellbook: CharacterSpellbook;
}

export function PrepareSpells({ spellbook }: ManagerProps): JSX.Element {
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
              const specialSlotSchool = i > 0 ? spellbook.arcaneSchoolPrepareSlot?.school : '';
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
                    {specialSlot > 0 && specialSlotSchool
                      ? ` ${specialSlot} 个${schoolTranslates[specialSlotSchool]}额外法术位`
                      : ''}
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

export function ManageSpells({ spellbook }: ManagerProps): JSX.Element {
  return (
    <Observer>
      {() => (
        <>
          {spellbook.knownSpells.map((spells, level) => {
            const availableSpells = spellbook.classSpells[level].filter((s) => !spells.includes(s));

            return (
              <Box key={level}>
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
                  {level} 环
                </Text>
                {availableSpells.length > 0 ? (
                  <EntityPickerPopover
                    text="学习新法术"
                    entities={availableSpells}
                    onPick={(s) => spellbook.addSpell(s)}
                    closeOnPick
                    listAll
                  />
                ) : null}
                <SimpleGrid columns={[1, 3]} spacing="2" py="2">
                  {spells.map((s, i) => (
                    <SimpleEntity
                      key={`${s.id}:${i}`}
                      entity={s}
                      addon={
                        <IconButton
                          aria-label="移除法术"
                          icon={<FaTrash />}
                          colorScheme="red"
                          size="sm"
                          height="auto"
                          borderLeftRadius="0"
                          onClick={() => spellbook.removeSpell(s)}
                        />
                      }
                    />
                  ))}
                </SimpleGrid>
              </Box>
            );
          })}
        </>
      )}
    </Observer>
  );
}

interface TogglerProps extends ManagerProps {
  buttonProps?: ButtonProps;
}

export function SpellbookManagerToggler({ spellbook, buttonProps }: TogglerProps): JSX.Element {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const disablePrepare = spellbook.castingType === 'sorcerer-like';

  return (
    <>
      <Button {...buttonProps} onClick={() => onOpen()}>
        法术管理
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            {isOpen ? (
              <Tabs isLazy defaultIndex={disablePrepare ? 1 : 0}>
                <TabList>
                  <Tab isDisabled={disablePrepare}>准备法术</Tab>
                  <Tab>管理法术</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <PrepareSpells spellbook={spellbook} />
                  </TabPanel>
                  <TabPanel>
                    <ManageSpells spellbook={spellbook} />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => onClose()}>OK</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
