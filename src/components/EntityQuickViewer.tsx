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
import { CollectionEntityType } from '../store/collection';
import { Entity, Feat as FeatEntity, Spell as SpellEntity } from '../types/core';

import Feat from './Feat';
import Spell from './Spell';

export default function EntityQuickViewer(): JSX.Element {
  const { ui } = useStore();
  const onClose = useCallback(() => ui.closeQuickViewer(), []);
  const renderEntity = useCallback(() => {
    switch (ui.quickViewerKind) {
      case 'feat':
        return <Feat feat={ui.quickViewerEntity as FeatEntity} />;
      case 'spell':
        return <Spell spell={ui.quickViewerEntity as SpellEntity} />;
      default:
        return <Text>不能显示</Text>;
    }
  }, []);

  return (
    <Observer>
      {() => (
        <Drawer isOpen={Boolean(ui.quickViewerEntity)} onClose={onClose} size="lg">
          <DrawerOverlay>
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
  kind: CollectionEntityType;
  entity: Entity;
}

export function EntityQuickViewerToggler({ kind, entity }: TogglerProps): JSX.Element {
  const { ui } = useStore();

  return (
    <Icon
      as={FaInfoCircle}
      color="teal.500"
      w="20px"
      h="20px"
      onClick={(e) => {
        e.stopPropagation();

        ui.showQuickViewer(kind, entity);
      }}
      cursor="pointer"
      _hover={{
        color: 'teal.400',
      }}
    />
  );
}
