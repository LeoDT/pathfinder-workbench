import { Observer } from 'mobx-react-lite';
import { useCallback } from 'react';
import { FaChevronLeft, FaInfoCircle } from 'react-icons/fa';

import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Heading,
  Icon,
  IconButton,
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
  SpecialFeat,
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
    const e = ui.currentQuickViewerEntity;

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subs = (e as any).subs as SpecialFeat[];
        const subsEl = Array.isArray(subs) ? (
          <>
            <Box mt="2">
              {subs.map((sub) => (
                <Box
                  key={sub.id}
                  border="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                  p="2"
                  mb="2"
                >
                  <Heading as="h4" fontSize="md" color={ENTITY_COLORS.feat}>
                    {sub.name} <small style={{ fontWeight: 'normal' }}>({sub.id})</small>
                  </Heading>
                  <Text
                    pt="1"
                    whiteSpace="pre-wrap"
                    dangerouslySetInnerHTML={{ __html: sub.desc }}
                  />
                </Box>
              ))}
            </Box>
          </>
        ) : null;

        return (
          <Box>
            <Heading as="h4" fontSize="lg" color={ENTITY_COLORS.feat}>
              {e.name} <small style={{ fontWeight: 'normal' }}>({e.id})</small>
            </Heading>
            {descEl}
            {subsEl}
          </Box>
        );
      }
    }
  }, []);

  return (
    <Observer>
      {() => (
        <Drawer
          isOpen={Boolean(ui.currentQuickViewerEntity)}
          onClose={onClose}
          size="lg"
          returnFocusOnClose
        >
          <DrawerOverlay zIndex="quickViewer">
            <DrawerContent>
              <DrawerBody>{renderEntity()}</DrawerBody>
              {ui.quickViewerEntities.length > 1 ? (
                <IconButton
                  aria-label="后退"
                  icon={<Icon as={FaChevronLeft} width="1em" height="1em" />}
                  onClick={() => ui.backQuickViewer()}
                  position="absolute"
                  top="10"
                  right="3"
                  fontSize="sm"
                  size="sm"
                  variant="ghost"
                  borderRadius="md"
                  colorScheme="blackAlpha"
                  color="black"
                />
              ) : null}

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
