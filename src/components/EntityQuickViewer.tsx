import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
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
} from '../types/core';

import Feat from './Feat';
import Spell from './Spell';
import WeaponType from './WeaponType';
import ArmorType from './ArmorType';

export default function EntityQuickViewer(): JSX.Element {
  const { ui } = useStore();
  const onClose = useCallback(() => ui.closeQuickViewer(), []);
  const renderEntity = useCallback(() => {
    switch (ui.quickViewerEntity?._type) {
      case 'feat':
        return <Feat feat={ui.quickViewerEntity as FeatEntity} />;
      case 'spell':
        return <Spell spell={ui.quickViewerEntity as SpellEntity} />;
      case 'weaponType':
        return <WeaponType weaponType={ui.quickViewerEntity as WeaponTypeType} />;
      case 'armorType':
        return <ArmorType armorType={ui.quickViewerEntity as ArmorTypeType} />;
      default:
        return <Text>不能显示</Text>;
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
