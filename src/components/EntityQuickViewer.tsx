import { Observer } from 'mobx-react-lite';
import { useCallback } from 'react';
import { FaInfoCircle } from 'react-icons/fa';

import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Heading,
  Icon,
  Text,
} from '@chakra-ui/react';

import { ENTITY_COLORS } from '../constant';
import { useStore } from '../store';
import { ArcaneSchool as ArcaneSchoolType } from '../types/arcaneSchool';
import { Bloodline as BloodlineType } from '../types/bloodline';
import {
  Archetype as ArchetypeType,
  ArmorType as ArmorTypeType,
  Class as ClassType,
  Entity,
  Feat as FeatEntity,
  MagicItemType as MagicItemTypeType,
  Spell as SpellEntity,
  WeaponType as WeaponTypeType,
} from '../types/core';
import { Domain as DomainType } from '../types/domain';
import { ArcaneSchool } from './ArcaneSchool';
import { Archetype } from './Archetype';
import { ArmorType } from './ArmorType';
import { Bloodline } from './Bloodline';
import { Class } from './Class';
import { DescriptionTable, convertRecordToDescriptions } from './DescriptionTable';
import { Domain } from './Domain';
import { Feat } from './Feat';
import { MagicItemType } from './MagicItemType';
import { Spell } from './Spell';
import { WeaponType } from './WeaponType';

export function EntityQuickViewer(): JSX.Element {
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
      case 'magicItemType':
        return <MagicItemType magicItemType={e as MagicItemTypeType} showId />;
      case 'class':
        return <Class clas={e as ClassType} />;
      case 'arcaneSchool':
        return <ArcaneSchool arcaneSchool={e as ArcaneSchoolType} />;
      case 'domain':
        return <Domain domain={e as DomainType} />;
      case 'bloodline':
        return <Bloodline bloodline={e as BloodlineType} />;
      case 'archetype':
        return <Archetype archetype={e as ArchetypeType} />;
      default: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const desc = (e as any).desc;
        const descEl =
          typeof desc === 'string' ? (
            <Text pt="1" whiteSpace="pre-wrap" dangerouslySetInnerHTML={{ __html: desc }} />
          ) : typeof desc === 'object' ? (
            <DescriptionTable
              descriptions={convertRecordToDescriptions(desc as Record<string, string>)}
            />
          ) : null;

        return (
          <Box>
            <Heading as="h4" fontSize="lg" color={ENTITY_COLORS.feat}>
              {e.name} <small style={{ fontWeight: 'normal' }}>({e.id})</small>
            </Heading>
            {descEl}
          </Box>
        );
      }
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
