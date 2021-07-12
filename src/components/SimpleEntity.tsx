import { template } from 'lodash-es';
import { ReactNode, useMemo } from 'react';
import { FaInfoCircle } from 'react-icons/fa';

import {
  Badge,
  BadgeProps,
  Box,
  HStack,
  Heading,
  HeadingProps,
  Icon,
  Spacer,
  StackProps,
} from '@chakra-ui/react';

import { ENTITY_COLORS } from '../constant';
import { useStore } from '../store';
import { Entity, Feat as FeatType } from '../types/core';
import { EntityQuickViewerToggler } from './EntityQuickViewer';
import { useOptionalCharacter } from './context';

interface BaseProps {
  entity: Entity;
  showId?: boolean;
  quickViewer?: boolean;
}

interface Props extends BaseProps, StackProps {
  addon?: ReactNode;
}

export function SimpleEntity({
  entity,
  showId = false,
  quickViewer = true,
  addon,
  ...props
}: Props): JSX.Element {
  const character = useOptionalCharacter();
  const calculatedValueInName = useMemo(() => {
    if (character) {
      const cv = entity.calculatedValues?.find((c) => c.showInName);

      if (cv) {
        const value = character.parseFormulaNumber(cv.formula);
        const tpl = template(cv.showInNameTemplate ?? '<%= value %>');

        return tpl({ value });
      }
    }
  }, [entity, character]);
  const children = (
    <>
      {entity.name} {showId ? <small style={{ fontWeight: 'normal' }}>({entity.id})</small> : null}
      {calculatedValueInName ? `(${calculatedValueInName})` : null}
    </>
  );
  const headingProps = useMemo<HeadingProps>(
    () => ({
      as: 'h4',
      fontSize: 'lg',
      textDecoration: entity.deprecated ? 'solid line-through 2px red' : '',
      color: ENTITY_COLORS[entity._type],
    }),
    [entity]
  );
  const name = <Heading {...headingProps}>{children}</Heading>;
  let badge;

  switch (entity._type) {
    case 'feat':
      badge = entity._type === 'feat' ? <Badge>{(entity as FeatType).book}</Badge> : null;

      break;
  }

  return (
    <HStack
      spacing="0"
      minW="36"
      border="1px"
      borderColor="gray.200"
      borderRadius="md"
      _hover={{
        borderColor: 'gray.300',
      }}
      alignItems="stretch"
      {...props}
    >
      <HStack p="2" w="100%">
        {badge}
        {name}
        <Spacer />
        {quickViewer ? <EntityQuickViewerToggler entity={entity} /> : null}
      </HStack>
      {addon}
    </HStack>
  );
}

interface PropsForBadge extends BaseProps, BadgeProps {}

export function SimpleEntityBadge({
  entity,
  showId = false,
  quickViewer = false,
  ...badgeProps
}: PropsForBadge): JSX.Element {
  const { ui } = useStore();
  const props: BadgeProps = quickViewer
    ? {
        cursor: 'pointer',
        _hover: {
          opacity: 0.8,
        },
        onClick: () => {
          ui.showQuickViewer(entity);
        },
      }
    : {};

  return (
    <Badge fontSize="md" verticalAlign="top" colorScheme="blue" {...badgeProps} {...props}>
      {entity.name}
      {showId ? <small style={{ fontWeight: 'normal' }}>({entity.id})</small> : null}
      {quickViewer ? <Icon as={FaInfoCircle} verticalAlign="-2px" ml="2px" /> : null}
    </Badge>
  );
}

interface PropsWithChild extends Props {
  child: ReactNode;
}

export function SimpleEntityWithChild({ child, ...props }: PropsWithChild): JSX.Element {
  const entity = <SimpleEntity {...props} />;

  return child ? (
    <Box>
      {entity}

      <Box pl="4" pt="2">
        {child}
      </Box>
    </Box>
  ) : (
    entity
  );
}
