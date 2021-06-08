import { without } from 'lodash-es';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Box,
  Button,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Portal,
  SimpleGrid,
  Text,
  useDisclosure,
} from '@chakra-ui/react';

import { ENTITY_COLORS } from '../constant';
import { useStore } from '../store';
import { Archetype, Class } from '../types/core';
import { CollectionEntityPickerPopover } from './CollectionEntityPicker';
import SimpleEntity from './SimpleEntity';

interface ClassPickerValue {
  classId: string;
  archetypeIds: string[] | null;
}

interface Props {
  value: ClassPickerValue;
  onChange: (v: ClassPickerValue) => void;
  levels?: Map<Class, number>;
  excludedArchetypes?: Archetype[];
}

export function ClassPicker({ value, onChange, levels, excludedArchetypes }: Props): JSX.Element {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { collections } = useStore();
  const [classId, setClassId] = useState<string>(value.classId);
  const [archetypeIds, setArchetypeIds] = useState<string[] | null>(value.archetypeIds);
  const clas = useMemo(() => collections.class.getById(classId), [classId]);
  const allArchetypes = useMemo(() => collections.archetype.getByClass(clas), [clas]);
  const noConflictArchetypes = useMemo(
    () =>
      archetypeIds || excludedArchetypes
        ? collections.archetype.noConflictArchetypes(clas, [
            ...(archetypeIds || []),
            ...(excludedArchetypes?.map((a) => a.id) || []),
          ])
        : allArchetypes,
    [archetypeIds, allArchetypes, clas, excludedArchetypes]
  );
  const finished = useMemo(() => Boolean(classId), [classId]);
  const classPickerItems = useMemo(() => [classId], [classId]);
  const pickerLabelRenderer = useCallback(
    (v: Class) => {
      const existed = levels?.get(v);

      return (
        <Text>
          {v.name} Lv.{existed ? existed : 1}
        </Text>
      );
    },
    [levels]
  );

  useEffect(() => {
    if (value.classId !== classId) {
      setClassId(value.classId);
    }

    if (value.archetypeIds !== archetypeIds) {
      setArchetypeIds(value.archetypeIds);
    }
  }, [isOpen]);

  console.log(noConflictArchetypes);

  return (
    <>
      <Button onClick={() => onOpen()}>选择职业</Button>
      <Portal>
        <Modal
          isOpen={isOpen}
          onClose={() => {
            onClose();
          }}
          scrollBehavior="inside"
          size="xl"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>职业</ModalHeader>
            <ModalBody>
              <CollectionEntityPickerPopover
                text={clas.name}
                collection={collections.class}
                items={classPickerItems}
                onPick={(v) => {
                  setClassId(v);
                  setArchetypeIds(null);
                }}
                listAll
                textWithArrow
                closeOnPick
                labelRenderer={levels ? pickerLabelRenderer : undefined}
              />

              <Heading as="h4" fontSize="lg" mt="4" mb="2">
                职业变种
              </Heading>

              {allArchetypes.length ? (
                <SimpleGrid spacing="2" columns={[1, 2]}>
                  {allArchetypes.map((a) => {
                    const selected = archetypeIds?.includes(a.id);
                    const disabled = !noConflictArchetypes.includes(a) && !selected;

                    return (
                      <Box
                        key={a.id}
                        cursor={disabled ? 'not-allowed' : 'pointer'}
                        onClick={() => {
                          if (!disabled) {
                            if (selected) {
                              setArchetypeIds(without(archetypeIds, a.id));
                            } else {
                              setArchetypeIds([...(archetypeIds ?? []), a.id]);
                            }
                          }
                        }}
                      >
                        <SimpleEntity
                          entity={a}
                          opacity={disabled ? 0.5 : 1}
                          borderColor={selected ? ENTITY_COLORS.class : 'gray.200'}
                          _hover={{
                            borderColor: selected ? ENTITY_COLORS.class : 'gray.300',
                          }}
                        />
                      </Box>
                    );
                  })}
                </SimpleGrid>
              ) : (
                <Text>暂无职业变种</Text>
              )}
            </ModalBody>
            <ModalFooter>
              <HStack>
                <Button
                  colorScheme="teal"
                  isDisabled={!finished}
                  onClick={() => {
                    if (finished) {
                      onChange({
                        classId,
                        archetypeIds,
                      });
                      onClose();
                    }
                  }}
                >
                  确认
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Portal>
    </>
  );
}
