import { intersection, without } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import { FaCheck } from 'react-icons/fa';

import { Badge, Box, HStack, Heading, Icon } from '@chakra-ui/react';

import { useStore } from '../store';
import { Domain } from '../types/domain';
import { EffectGainDomainArgs, EffectGainDomainInput } from '../types/effectType';
import { EntityQuickViewerToggler } from './EntityQuickViewer';

interface Props extends EffectGainDomainArgs {
  value: EffectGainDomainInput;
  onChange: (v: EffectGainDomainInput) => void;
}

const domainStyle = {
  w: 'full',
  cursor: 'pointer',
  role: 'group',
};
const domainNameStyle = {
  fontSize: 'md',
  color: 'blue.600',
  flexGrow: 1,
  _groupHover: {
    color: 'blue.400',
  },
};
const disabledStyle = {
  opacity: 0.6,
  cursor: 'not-allowed',
};

export function DomainPicker({ inquisition, amount, value, onChange, druid }: Props): JSX.Element {
  const { collections } = useStore();
  const entities = useMemo(
    () =>
      inquisition
        ? collections.domain.data
        : druid
        ? collections.domain.dataDruid
        : collections.domain.dataWithoutInquisition,
    [inquisition, druid]
  );
  const realValue = value?.domains || [];
  const onPick = useCallback(
    (d: Domain) => () => {
      onChange({ domains: [...realValue, d.id].slice(0 - amount) });
    },
    [value, onChange, amount]
  );
  const onUnpick = useCallback(
    (d: Domain) => () => {
      onChange({ domains: without(realValue, d.id) });
    },
    [value, onChange]
  );

  return (
    <Box>
      {entities.map((d) => {
        const picked = realValue.includes(d.id);
        const subPicked =
          intersection(
            realValue,
            d.subDomains?.map((s) => s.id)
          ).length > 0;
        const disablePick = picked || subPicked;

        return d.subDomains ? (
          <Box mb="2" border="1px" borderColor="gray.200" borderRadius="md" key={d.id}>
            <HStack
              p="2"
              borderBottom="1px"
              borderColor="gray.200"
              {...domainStyle}
              onClick={picked ? onUnpick(d) : disablePick ? undefined : onPick(d)}
              {...(disablePick && !picked ? disabledStyle : {})}
            >
              <Badge>{d.inquisition ? '裁决域' : '领域'}</Badge>
              {picked ? <Icon as={FaCheck} /> : null}
              <Heading as="h4" {...domainNameStyle}>
                {d.name}
              </Heading>
              <EntityQuickViewerToggler entity={d} />
            </HStack>
            <>
              {d.subDomains.map((sub) => {
                const p = realValue.includes(sub.id);
                const dis = p || disablePick;

                return (
                  <HStack
                    p="2"
                    key={sub.id}
                    backgroundColor="gray.50"
                    _notLast={{ borderBottom: '1px', borderColor: 'gray.200' }}
                    {...domainStyle}
                    onClick={p ? onUnpick(sub) : dis ? undefined : onPick(sub)}
                    {...(dis && !p ? disabledStyle : {})}
                  >
                    <Badge>子域</Badge>
                    {p ? <Icon as={FaCheck} /> : null}
                    <Heading as="h4" {...domainNameStyle}>
                      {sub.name}
                    </Heading>
                  </HStack>
                );
              })}
            </>
          </Box>
        ) : (
          <HStack
            key={d.id}
            mb="2"
            border="1px"
            borderColor="gray.200"
            borderRadius="md"
            p="2"
            {...domainStyle}
            onClick={picked ? onUnpick(d) : disablePick ? undefined : onPick(d)}
            {...(disablePick ? disabledStyle : {})}
          >
            <Badge>{d.inquisition ? '裁决域' : '领域'}</Badge>
            {picked ? <Icon as={FaCheck} /> : null}
            <Heading as="h4" {...domainNameStyle}>
              {d.name}
            </Heading>

            <EntityQuickViewerToggler entity={d} />
          </HStack>
        );
      })}
    </Box>
  );
}
