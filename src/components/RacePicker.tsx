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
  useDisclosure,
} from '@chakra-ui/react';

import { ENTITY_COLORS } from '../constant';
import { useStore } from '../store';
import { Race, RacialTrait } from '../types/core';
import { CollectionEntitySelect } from './CollectionEntitySelect';
import { SimpleEntity } from './SimpleEntity';

interface RacePickerValue {
  raceId: string;
  alternateRaceTraitIds: string[];
}

interface Props {
  value: RacePickerValue;
  onChange: (v: RacePickerValue) => void;
}

export function RacePicker({ onChange, value }: Props): JSX.Element {
  const { collections } = useStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [raceId, setRaceId] = useState<string>(value.raceId);
  const [alternateRaceTraitIds, setAlternatRaceTraitIds] = useState<string[]>(
    value.alternateRaceTraitIds
  );
  const finished = useMemo(() => {
    return Boolean(raceId);
  }, [raceId]);
  const reset = useCallback(() => {
    setRaceId('');
    setAlternatRaceTraitIds([]);
  }, []);
  const race = useMemo<Race | null>(() => {
    if (raceId) {
      return collections.race.getById(raceId);
    }

    return null;
  }, [raceId]);
  const select = useCallback(
    (t: RacialTrait) => {
      if (alternateRaceTraitIds.includes(t.id)) {
        setAlternatRaceTraitIds(without(alternateRaceTraitIds, t.id));
      } else {
        setAlternatRaceTraitIds([...alternateRaceTraitIds, t.id]);
      }
    },
    [alternateRaceTraitIds]
  );
  const disabledTraits = useMemo<string[]>(() => {
    if (race) {
      const traits: string[] = [];

      alternateRaceTraitIds.forEach((id) => {
        const alt = race.alternateRacialTrait.find((t) => t.id === id);

        if (alt) {
          alt.replace?.forEach((r) => {
            traits.push(r);

            race.alternateRacialTrait.forEach((t) => {
              if (t.replace?.includes(r)) {
                traits.push(t.id);
              }
            });
          });
        }
      });

      return traits;
    }

    return [];
  }, [race, alternateRaceTraitIds]);

  useEffect(() => {
    if (value) {
      setRaceId(value.raceId);
      setAlternatRaceTraitIds(value.alternateRaceTraitIds);
    } else {
      reset();
    }
  }, [value, isOpen]);

  return (
    <>
      <Button onClick={onOpen}>选择种族</Button>
      <Portal>
        <Modal
          isOpen={isOpen}
          onClose={() => {
            reset();
            onClose();
          }}
          scrollBehavior="inside"
          size="xl"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>种族</ModalHeader>
            <ModalBody>
              <CollectionEntitySelect
                value={raceId || ''}
                onChange={(v) => setRaceId(v)}
                placeholder="选择种族"
                collection={collections.race}
              />

              {race ? (
                <>
                  <Heading as="h4" fontSize="lg" mt="4" mb="2">
                    种族特性
                  </Heading>
                  <SimpleGrid columns={[1, 3]} spacing="2">
                    {race.racialTrait.map((t) => {
                      const disabled = disabledTraits.includes(t.id);

                      return (
                        <Box key={t.id} opacity={disabled ? 0.5 : 1}>
                          <SimpleEntity entity={t} />
                        </Box>
                      );
                    })}
                  </SimpleGrid>

                  <Heading as="h4" fontSize="lg" mt="4" mb="2">
                    可替换种族特性
                  </Heading>
                  <SimpleGrid columns={[1, 3]} spacing="2">
                    {race.alternateRacialTrait.map((t) => {
                      const selected = alternateRaceTraitIds.includes(t.id);
                      const disabled = disabledTraits.includes(t.id) && !selected;

                      return (
                        <Box
                          key={t.id}
                          opacity={disabled ? 0.5 : 1}
                          cursor={disabled ? 'not-allowed' : 'pointer'}
                          onClick={disabled ? undefined : () => select(t)}
                        >
                          <SimpleEntity
                            entity={t}
                            borderColor={selected ? ENTITY_COLORS.feat : 'gray.200'}
                            _hover={{
                              borderColor: selected ? ENTITY_COLORS.feat : 'gray.300',
                            }}
                          />
                        </Box>
                      );
                    })}
                  </SimpleGrid>
                </>
              ) : null}
            </ModalBody>
            <ModalFooter>
              <HStack>
                <Button
                  colorScheme="teal"
                  isDisabled={!finished}
                  onClick={() => {
                    if (finished) {
                      onChange({
                        raceId,
                        alternateRaceTraitIds,
                      });
                      onClose();
                    }
                  }}
                >
                  确认
                </Button>
                <Button onClick={() => reset()}>重置</Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Portal>
    </>
  );
}
