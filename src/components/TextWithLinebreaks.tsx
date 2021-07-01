import { useMemo } from 'react';

import { Box, BoxProps, Text, TextProps } from '@chakra-ui/layout';

interface Props extends BoxProps {
  text: string;
  textProps?: TextProps;
}

export function TextWithLinebreaks({ text, textProps, ...props }: Props): JSX.Element {
  const converted = useMemo(() => text.split('\n'), [text]);

  return (
    <Box {...props}>
      {converted.map((t, i) => (
        <Text key={i} {...textProps}>
          {t}
        </Text>
      ))}
    </Box>
  );
}
