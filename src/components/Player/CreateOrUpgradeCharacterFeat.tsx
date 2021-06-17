import { Observer } from 'mobx-react-lite';

import { Box, Divider, Heading } from '@chakra-ui/react';

import { useStore } from '../../store';
import CreateCharacterStore from '../../store/createCharacter';
import { Feat } from '../../types/core';
import { translateGainFeatEffectArgs } from '../../utils/effect';
import { gainFeatReasonTranslates } from '../../utils/upgrade';
import { CollectionEntityPickerPopover } from '../CollectionEntityPicker';
import { EntityPickerPopover, PopoverProps as EntityPickerProps } from '../EntityPicker';
import { FeatWithEffectInputGrid } from './FeatWithEffectInputGrid';

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

              const { bloodline } = createOrUpgrade.character;
              if (r.bloodlineFeat && !bloodline) {
                throw new Error('gain bloodline feat need character has a bloodline');
              }
              const maybeFeatIdsWithInput =
                r.bloodlineFeat && bloodline ? bloodline.feats : r.feats;
              const maybeFeatsWithInput = maybeFeatIdsWithInput
                ? collections.feat.getByIdsWithInputs(maybeFeatIdsWithInput)
                : undefined;

              const pickerProps: EntityPickerProps<Feat> = {
                text: '选择专长',
                items: [createOrUpgrade.upgrade.feats[r.index]],
                onPick: (fId) => {
                  createOrUpgrade.upgrade.feats[r.index] = fId;
                  createOrUpgrade.deleteEffectInput('feat', fId, r.index.toString());

                  const withInput = maybeFeatsWithInput?.find((f) => f.input && f.feat.id === fId);
                  if (withInput) {
                    createOrUpgrade.setEffectInput(
                      'feat',
                      fId,
                      withInput.input,
                      r.index.toString()
                    );
                  }
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

              return (
                <Box key={`${r.reason}#${i}`} mb="4">
                  <Heading as="h3" fontSize="lg" mb="2">
                    {translateGainFeatEffectArgs(r)}({gainFeatReasonTranslates[r.reason]}
                    {r.ignorePrerequisites ? ', 忽略先决条件' : ''})
                  </Heading>
                  <Box mb="2">
                    {r.forceFeat ? null : maybeFeatsWithInput ? (
                      <EntityPickerPopover
                        {...pickerProps}
                        entities={maybeFeatsWithInput.map(({ feat }) => feat)}
                        listAll
                      />
                    ) : r.featType ? (
                      <EntityPickerPopover
                        {...pickerProps}
                        entities={collections.feat.getByType(r.featType)}
                      />
                    ) : (
                      <CollectionEntityPickerPopover
                        {...pickerProps}
                        collection={collections.feat}
                      />
                    )}
                  </Box>
                  {feat ? (
                    <FeatWithEffectInputGrid
                      entities={[feat]}
                      effectInputSuffixes={[r.index.toString()]}
                      createOrUpgrade={createOrUpgrade}
                      isReadonly={(feat) =>
                        Boolean(maybeFeatsWithInput?.find((f) => f.input && f.feat === feat))
                      }
                    />
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
          <FeatWithEffectInputGrid
            entities={createOrUpgrade.allNewGainedClassFeats}
            createOrUpgrade={createOrUpgrade}
          />
        )}
      </Observer>
      {showRaceTraits ? (
        <>
          <Heading as="h3" fontSize="lg" my="4">
            种族特性
          </Heading>
          <Observer>
            {() => (
              <FeatWithEffectInputGrid
                entities={createOrUpgrade.character.racialTraits}
                createOrUpgrade={createOrUpgrade}
              />
            )}
          </Observer>
        </>
      ) : null}
    </Box>
  );
}
