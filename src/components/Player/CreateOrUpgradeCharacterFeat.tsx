import { Observer } from 'mobx-react-lite';

import { Box, Divider, Heading, SimpleGrid } from '@chakra-ui/react';

import { useStore } from '../../store';
import CreateCharacterStore from '../../store/createCharacter';
import { translateGainFeatEffectArgs } from '../../utils/effect';
import { gainFeatReasonTranslates } from '../../utils/upgrade';
import { CollectionEntityPickerPopover } from '../CollectionEntityPicker';
import { EntityPickerPopover, PopoverProps as EntityPickerProps } from '../EntityPicker';
import SimpleEntity from '../SimpleEntity';
import { EffectInput } from './EffectInput';

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
              const feat = fId ? collections.feat.getById(fId) : null;

              const pickerProps: EntityPickerProps = {
                text: '选择专长',
                items: [createOrUpgrade.upgrade.feats[r.index]],
                onPick: (fId) => {
                  createOrUpgrade.upgrade.feats[r.index] = fId;
                  createOrUpgrade.deleteEffectInput('feat', fId, r.index.toString());
                },
                onUnpick: () => {
                  createOrUpgrade.deleteEffectInput(
                    'feat',
                    createOrUpgrade.upgrade.feats[r.index],
                    r.index.toString()
                  );
                  createOrUpgrade.upgrade.feats[r.index] = '';
                },
                disabledEntityIds: createOrUpgrade.character.gainedFeats.map((f) => f.id),
              };

              const effectsNeedInput = createOrUpgrade.character.effect.getEffectsNeedInput();
              const es = effectsNeedInput.find(({ source }) => source === feat);

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
                    <Box mb="4" mt="2">
                      <SimpleGrid columns={[1, 3]} spacing="2" mb="2">
                        <SimpleEntity entity={feat} />
                      </SimpleGrid>

                      {es ? (
                        <EffectInput
                          effect={es.effect}
                          createOrUpgrade={createOrUpgrade}
                          value={createOrUpgrade.getEffectInput(
                            'feat',
                            feat.id,
                            r.index.toString()
                          )}
                          onChange={(v) => {
                            createOrUpgrade.setEffectInput('feat', feat.id, v, r.index.toString());
                          }}
                        />
                      ) : null}
                    </Box>
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
              <SimpleEntity key={f.id} entity={f} />
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
                {createOrUpgrade.character.racialTraits.map((f) => (
                  <SimpleEntity key={f.id} entity={f} />
                ))}
              </SimpleGrid>
            )}
          </Observer>
        </>
      ) : null}
    </Box>
  );
}
