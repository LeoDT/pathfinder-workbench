import { Observer } from 'mobx-react-lite';
import { Box, Heading, Divider, SimpleGrid } from '@chakra-ui/react';

import { ENTITY_COLORS } from '../../constant';
import { useStore } from '../../store';
import { useCreateCharacterStore } from '../../store/createCharacter';

import { gainFeatReasonTranslates } from '../../utils/upgrade';

import { CollectionEntityPickerPopover } from '../CollectionEntityPicker';
import Feat from '../Feat';

export default function CreateCharacterFeat(): JSX.Element {
  const store = useStore();
  const create = useCreateCharacterStore();

  return (
    <Box>
      <Observer>
        {() => (
          <>
            {create.gainFeatReasons.map((r) => {
              const fId = create.upgrade.feats[r.index];
              const feat = fId
                ? store.collections.feat.getById(create.upgrade.feats[r.index])
                : null;

              return (
                <Box key={r.reason}>
                  <Heading as="h3" fontSize="lg" mb="2">
                    新专长({gainFeatReasonTranslates[r.reason]})
                  </Heading>
                  <CollectionEntityPickerPopover
                    text="选择专长"
                    collection={store.collections.feat}
                    items={[create.upgrade.feats[r.index]]}
                    onPick={(fId) => {
                      create.upgrade.feats[r.index] = fId;
                    }}
                    onUnpick={() => {
                      create.upgrade.feats[r.index] = '';
                    }}
                  />
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
            {create.newGainedClassFeats.map((f) => (
              <Box key={f.id} border="1px" borderColor="gray.200" p="2" borderRadius="md">
                <Heading as="h4" fontSize="lg" color={ENTITY_COLORS.feat}>
                  {f.name} <small style={{ fontWeight: 'normal' }}>({f.id})</small>
                </Heading>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Observer>
      <Heading as="h3" fontSize="lg" mb="4">
        种族特性
      </Heading>
      <Observer>
        {() => (
          <SimpleGrid columns={[1, 3]} spacing="2">
            {create.character.race.racialTrait.map((f) => (
              <Box key={f.id} border="1px" borderColor="gray.200" p="2" borderRadius="md">
                <Heading as="h4" fontSize="lg" color={ENTITY_COLORS.feat}>
                  {f.name} <small style={{ fontWeight: 'normal' }}>({f.id})</small>
                </Heading>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Observer>
    </Box>
  );
}
