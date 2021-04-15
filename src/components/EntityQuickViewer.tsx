import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  Box,
  Heading,
  Text,
  Icon,
} from '@chakra-ui/react';
import { Observer } from 'mobx-react-lite';
import { useCallback } from 'react';
import { FaInfoCircle } from 'react-icons/fa';

import { useStore } from '../store';
import {
  Entity,
  Feat as FeatEntity,
  Spell as SpellEntity,
  WeaponType as WeaponTypeType,
  ArmorType as ArmorTypeType,
  SpecialFeat,
} from '../types/core';

import Feat from './Feat';
import Spell from './Spell';
import WeaponType from './WeaponType';
import ArmorType from './ArmorType';
import { ENTITY_COLORS } from '../constant';

export default function EntityQuickViewer(): JSX.Element {
  const { ui } = useStore();
  const onClose = useCallback(() => ui.closeQuickViewer(), []);
  const renderEntity = useCallback(() => {
    const e = ui.quickViewerEntity;

    if (!e) return null;

    switch (e._type) {
      case 'feat':
        return <Feat feat={e as FeatEntity} showId />;
      case 'spell':
        return <Spell spell={e as SpellEntity} showId />;
      case 'weaponType':
        return <WeaponType weaponType={e as WeaponTypeType} showId />;
      case 'armorType':
        return <ArmorType armorType={e as ArmorTypeType} showId />;
      case 'classFeat':
      case 'racialTrait': {
        const feat = e as SpecialFeat;
        return (
          <Box>
            <Heading as="h4" fontSize="lg" color={ENTITY_COLORS.feat}>
              {feat.name} <small style={{ fontWeight: 'normal' }}>({feat.id})</small>
            </Heading>
            {feat.desc ? (
              <Text pt="1" whiteSpace="pre-wrap" dangerouslySetInnerHTML={{ __html: feat.desc }} />
            ) : null}
          </Box>
        );
      }
      default:
        return <Text>无法显示</Text>;
    }
  }, []);

  return (
    <Observer>
      {() => (
        <Drawer
          isOpen={Boolean(ui.quickViewerEntity)}
          onClose={onClose}
          size="lg"
          returnFocusOnClose
        >
          <DrawerOverlay zIndex="quickViewer">
            <DrawerContent>
              <DrawerBody>{renderEntity()}</DrawerBody>
              <DrawerCloseButton />
            </DrawerContent>
          </DrawerOverlay>
        </Drawer>
      )}
    </Observer>
  );
}

interface TogglerProps {
  entity: Entity;
}

export function EntityQuickViewerToggler({ entity }: TogglerProps): JSX.Element {
  const { ui } = useStore();

  return (
    <Icon
      as={FaInfoCircle}
      color="teal.500"
      w="20px"
      h="20px"
      onClick={(e) => {
        e.stopPropagation();

        ui.showQuickViewer(entity);
      }}
      cursor="pointer"
      _hover={{
        color: 'teal.400',
      }}
    />
  );
}
