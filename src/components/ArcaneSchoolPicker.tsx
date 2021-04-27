import { isEqual } from 'lodash-es';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, VStack, Flex, Heading, Button, HStack, Badge } from '@chakra-ui/react';

import { useStore } from '../store';
import { EffectGainArcaneSchoolInput } from '../types/effectType';

interface Props {
  value: EffectGainArcaneSchoolInput | null;
  onChange: (v: EffectGainArcaneSchoolInput) => void;
  standardForbidden: number;
}

const schoolStyle = {
  w: 'full',
  cursor: 'pointer',
};
const schoolNameStyle = {
  p: '2',
  fontSize: 'lg',
  color: 'blue.600',
  flexGrow: 1,
  _hover: {
    color: 'blue.400',
  },
};

export function ArcaneSchoolPicker({ value, onChange, standardForbidden }: Props): JSX.Element {
  const store = useStore();
  const [school, setSchool] = useState(() => {
    if (value?.school) {
      return store.collections.arcaneSchool.getById(value.school);
    }

    return null;
  });
  const [focused, setFocused] = useState(() => {
    if (school && school.type === 'standard' && value?.focused) {
      return school.focused.find((f) => f.id === value.focused);
    }

    return null;
  });
  const [forbidden, setForbidden] = useState(() => {
    if (value?.forbiddenSchool) {
      return value.forbiddenSchool.map((s) => store.collections.arcaneSchool.getById(s));
    }

    return [];
  });
  const finished = useMemo(() => {
    switch (school?.type) {
      case 'standard':
        return school.noConflict || forbidden.length === standardForbidden;
      case 'elemental':
        return forbidden.length > 0;
      default:
        return false;
    }
  }, [school, focus, forbidden]);
  const reset = useCallback(() => {
    setSchool(null);
    setFocused(null);
    setForbidden([]);
  }, []);

  useEffect(() => {
    if (value) {
      const vs = store.collections.arcaneSchool.getById(value.school);

      if (value.school !== school?.id) {
        setSchool(vs);
      }

      if (value.focused !== focused?.id && vs.type === 'standard') {
        if (value.focused) {
          const vf = vs.focused.find((f) => f.id === value.focused);

          if (!vf) {
            throw Error('wrong focused arcane school');
          }

          setFocused(vf);
        } else {
          setFocused(null);
        }
      }

      if (
        !isEqual(
          value.forbiddenSchool,
          forbidden.map((s) => s.id)
        )
      ) {
        setForbidden(value.forbiddenSchool.map((s) => store.collections.arcaneSchool.getById(s)));
      }
    } else {
      reset();
    }
  }, [value]);

  return (
    <Box>
      <Heading as="h3" fontSize="lg" mb="4">
        {finished ? '已选择完成' : school ? '选择对立学派' : '选择专精学派'}
      </Heading>
      {school ? (
        <HStack mb="4">
          <Badge colorScheme="blue" fontSize="md">
            {focused ? `${focused.name}(${school.name})` : school.name}
          </Badge>
          {forbidden.map((s) => (
            <Badge key={s.id} colorScheme="red" fontSize="md">
              {s.name}
            </Badge>
          ))}
        </HStack>
      ) : null}
      {finished ? null : (
        <VStack>
          {store.collections.arcaneSchool.data.map((s) => {
            switch (s.type) {
              case 'standard':
                if (school?.type === 'elemental') return null;
                if (school && s.noConflict) return null;
                if (school && school.id === s.id) return null;
                if (forbidden.includes(s)) return null;

                return (
                  <Box key={s.id} w="full" border="1px" borderColor="gray.200" borderRadius="md">
                    <Flex {...schoolStyle}>
                      <Heading
                        as="h4"
                        {...schoolNameStyle}
                        color={school ? 'red.600' : 'blue.600'}
                        _hover={{
                          color: school ? 'red.400' : 'blue.400',
                        }}
                        onClick={() => {
                          if (school) {
                            setForbidden([...forbidden, s]);
                          } else {
                            setSchool(s);
                          }
                        }}
                      >
                        {s.name}
                      </Heading>
                    </Flex>
                    {school
                      ? null
                      : s.focused?.map((focused, i) => (
                          <Flex
                            key={focused.id}
                            {...schoolStyle}
                            bgColor="gray.50"
                            borderTop="1px"
                            borderColor="gray.200"
                            borderBottomRadius={i + 1 === s.focused?.length ? 'md' : 'none'}
                          >
                            <Heading
                              as="h4"
                              {...schoolNameStyle}
                              onClick={() => {
                                setSchool(s);
                                setFocused(focused);
                              }}
                            >
                              {focused.name}
                            </Heading>
                          </Flex>
                        ))}
                  </Box>
                );
              case 'elemental':
                if (school?.type === 'standard') return null;
                if (school?.type === 'elemental' && !school.conflict.includes(s.id)) {
                  return null;
                }

                return (
                  <Box key={s.id} w="full" border="1px" borderColor="gray.200" borderRadius="md">
                    <Flex {...schoolStyle}>
                      <Heading
                        as="h4"
                        {...schoolNameStyle}
                        color={school ? 'red.600' : 'blue.600'}
                        _hover={{
                          color: school ? 'red.400' : 'blue.400',
                        }}
                        onClick={() => {
                          if (school) {
                            setForbidden([s]);
                          } else {
                            setSchool(s);

                            if (s.conflict.length === 1) {
                              const f = store.collections.arcaneSchool.getById(s.conflict[0]);
                              setForbidden([f]);
                            }
                          }
                        }}
                      >
                        {s.name}
                      </Heading>
                    </Flex>
                  </Box>
                );
              default:
                return null;
            }
          })}
        </VStack>
      )}
      <HStack>
        <Button
          colorScheme="teal"
          disabled={!finished}
          onClick={() => {
            if (school) {
              onChange({
                school: school.id,
                focused: focused?.id,
                forbiddenSchool: forbidden.map((s) => s.id),
              });
            }
          }}
        >
          确认
        </Button>
        <Button onClick={() => reset()}>重置</Button>
      </HStack>
    </Box>
  );
}
