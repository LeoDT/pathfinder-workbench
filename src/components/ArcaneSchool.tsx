import { Box, Divider, Heading, Text } from '@chakra-ui/react';

import { ENTITY_COLORS } from '../constant';
import { ArcaneSchool as ArcaneSchoolType } from '../types/arcaneSchool';

interface Props {
  arcaneSchool: ArcaneSchoolType;
}

export function ArcaneSchool({ arcaneSchool }: Props): JSX.Element {
  return (
    <Box>
      <Heading as="h4" fontSize="lg" color={ENTITY_COLORS.arcaneSchool}>
        {arcaneSchool.name} {<small style={{ fontWeight: 'normal' }}>({arcaneSchool.id})</small>}
      </Heading>
      {arcaneSchool.desc ? <Text my="2">{arcaneSchool.desc}</Text> : null}

      <Box>
        {arcaneSchool.powers.map((p) => (
          <Box key={p.id} p="2" border="1px" borderColor="gray.200" mb="2" borderRadius="md">
            <Heading as="h5" color={ENTITY_COLORS.classFeat} fontSize="lg" mb="2">
              {p.name} <small>({p.id})</small>
            </Heading>
            <Text dangerouslySetInnerHTML={{ __html: p.desc }} whiteSpace="pre-wrap" />
          </Box>
        ))}
      </Box>

      {arcaneSchool.type === 'standard' ? (
        <Box>
          <Divider />
          {arcaneSchool.focused.map((focused) => (
            <Box key={focused.id}>
              <Heading as="h5" color={ENTITY_COLORS.arcaneSchool} fontSize="lg" my="2">
                {focused.name} <small>({focused.id})</small>
              </Heading>

              <Text my="2">
                替换
                {focused.replace
                  .map((r) => arcaneSchool.powers.find((p) => p.id === r)?.name)
                  .join(', ')}
              </Text>

              {focused.powers.map((p) => (
                <Box key={p.id} p="2" border="1px" borderColor="gray.200" mb="2" borderRadius="md">
                  <Heading as="h5" color={ENTITY_COLORS.classFeat} fontSize="lg" mb="2">
                    {p.name} <small>({p.id})</small>
                  </Heading>
                  <Text dangerouslySetInnerHTML={{ __html: p.desc }} whiteSpace="pre-wrap" />
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}
