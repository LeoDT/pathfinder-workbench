import { without } from 'lodash';
import { Observer } from 'mobx-react-lite';
import { Box, Heading, Divider, SimpleGrid } from '@chakra-ui/react';

import { ENTITY_COLORS } from '../../constant';
import { useStore } from '../../store';
import { useCreateCharacterStore } from '../../store/createCharacter';

import CollectionEntityPicker from '../CollectionEntityPicker';
import Feat from '../Feat';

export default function CreateCharacterFeat(): JSX.Element {
  const store = useStore();
  const create = useCreateCharacterStore();

  return (
    <Box>
      <Heading as="h3" fontSize="lg" mb="4">
        初始专长
      </Heading>
      <Observer>
        {() => (
          <>
            <Box mb="2">
              <CollectionEntityPicker
                collection={store.collections.feat}
                items={create.upgrade.feats}
                onPick={(fId) => {
                  if (!create.upgrade.feats) {
                    create.upgrade.feats = [fId];
                  } else {
                    create.upgrade.feats.push(fId);
                  }
                }}
                onUnpick={(fId) => {
                  if (create.upgrade.feats) {
                    create.upgrade.feats = without(create.upgrade.feats, fId);
                  }
                }}
              />
            </Box>
            <SimpleGrid columns={[1, 3]} spacing="2">
              {create.upgrade.feats?.map((fId) => {
                const feat = store.collections.feat.getById(fId);

                if (feat) {
                  return (
                    <Box key={fId} border="1px" borderColor="gray.200" p="2" borderRadius="md">
                      <Feat
                        feat={feat}
                        showBrief={false}
                        showMeta={false}
                        showDescription={false}
                      />
                    </Box>
                  );
                }
              })}
            </SimpleGrid>
          </>
        )}
      </Observer>
      <Divider m="4" />
      <Heading as="h3" fontSize="lg" mb="4">
        已获得专长(种族, 职业)
      </Heading>
      <Observer>
        {() => (
          <SimpleGrid columns={[1, 3]} spacing="2">
            {[...create.character.race.racialTrait, ...create.character.gainedClassFeats].map(
              (f) => (
                <Box key={f.id} border="1px" borderColor="gray.200" p="2" borderRadius="md">
                  <Heading as="h4" fontSize="lg" color={ENTITY_COLORS.feat}>
                    {f.name} <small style={{ fontWeight: 'normal' }}>({f.id})</small>
                  </Heading>
                </Box>
              )
            )}
          </SimpleGrid>
        )}
      </Observer>
    </Box>
  );
}
