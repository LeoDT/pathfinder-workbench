import { Observer } from 'mobx-react-lite';

import { Box, Divider, Heading, SimpleGrid } from '@chakra-ui/react';

import { ENTITY_COLORS } from '../../constant';
import { useStore } from '../../store';
import CreateCharacterStore from '../../store/createCharacter';
import { translateGainFeatEffectArgs } from '../../utils/effect';
import { gainFeatReasonTranslates } from '../../utils/upgrade';
import { CollectionEntityPickerPopover } from '../CollectionEntityPicker';
import { EntityPickerPopover, PopoverProps as EntityPickerProps } from '../EntityPicker';
import Feat from '../Feat';

interface Props {
  createOrUpgrade: CreateCharacterStore;
  showRaceTraits: boolean;
}

export default function CreateOrUpgradeCharacterFeat({
  createOrUpgrade,
  showRaceTraits = false,
}: Props): JSX.Element {
  const { collections } = useStore();

  return (
    <Box>
      <Observer>
        {() => (
          <>
            {createOrUpgrade.gainFeatReasons.map((r, i) => {
              const fId = createOrUpgrade.upgrade.feats[r.index];
              const feat = fId
                ? collections.feat.getById(createOrUpgrade.upgrade.feats[r.index])
                : null;

              const pickerProps: EntityPickerProps = {
                text: '选择专长',
                items: [createOrUpgrade.upgrade.feats[r.index]],
                onPick: (fId) => {
                  createOrUpgrade.upgrade.feats[r.index] = fId;
                },
                onUnpick: () => {
                  createOrUpgrade.upgrade.feats[r.index] = '';
                },
                disabledEntityIds: createOrUpgrade.character.gainedFeats.map((f) => f.id),
              };

              return (
                <Box key={`${r.reason}#${i}`} mb="4">
                  <Heading as="h3" fontSize="lg" mb="2">
                    {translateGainFeatEffectArgs(r)}({gainFeatReasonTranslates[r.reason]}
                    {r.ignorePrerequisites ? ', 忽略先决条件' : ''})
                  </Heading>
                  {r.forceFeat ? null : r.feats ? (
                    <EntityPickerPopover
                      {...pickerProps}
                      entities={collections.feat.getByIds(r.feats)}
                      listAll
                    />
                  ) : r.featType ? (
                    <EntityPickerPopover
                      {...pickerProps}
                      entities={collections.feat.getByType(r.featType)}
                    />
                  ) : (
                    <CollectionEntityPickerPopover {...pickerProps} collection={collections.feat} />
                  )}
                  {feat ? (
                    <SimpleGrid columns={[1, 3]} spacing="2" mb="4" mt="2">
                      <Box border="1px" borderColor="gray.200" p="2" borderRadius="md" minW="64">
                        <Feat
                          feat={feat}
                          showBrief={false}
                          showMeta={false}
                          showDescription={false}
                        />
                      </Box>
                    </SimpleGrid>
                  ) : null}
                </Box>
              );
            })}
          </>
        )}
      </Observer>
      <Divider m="4" />
      <Heading as="h3" fontSize="lg" mb="4">
        获得职业特性
      </Heading>
      <Observer>
        {() => (
          <SimpleGrid columns={[1, 3]} spacing="2" mb="4">
            {createOrUpgrade.newGainedClassFeats.map((f) => (
              <Box key={f.id} border="1px" borderColor="gray.200" p="2" borderRadius="md">
                <Heading as="h4" fontSize="lg" color={ENTITY_COLORS.feat}>
                  {f.name} <small style={{ fontWeight: 'normal' }}>({f.id})</small>
                </Heading>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Observer>
      {showRaceTraits ? (
        <>
          <Heading as="h3" fontSize="lg" mb="4">
            种族特性
          </Heading>
          <Observer>
            {() => (
              <SimpleGrid columns={[1, 3]} spacing="2">
                {createOrUpgrade.character.race.racialTrait.map((f) => (
                  <Box key={f.id} border="1px" borderColor="gray.200" p="2" borderRadius="md">
                    <Heading as="h4" fontSize="lg" color={ENTITY_COLORS.feat}>
                      {f.name} <small style={{ fontWeight: 'normal' }}>({f.id})</small>
                    </Heading>
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </Observer>
        </>
      ) : null}
    </Box>
  );
}
