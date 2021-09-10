import { useLayoutEffect, useRef } from 'react';
import rough from 'roughjs/bin/rough';

import {
  Box,
  Button,
  ButtonGroup,
  HStack,
  Heading,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  useTheme,
} from '@chakra-ui/react';

import { ShapeStyle, Vector2, transformTranslate } from './utils';

const colors = [
  'gray',
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'cyan',
  'purple',
  'pink',
];

const fillStyles = ['hachure', 'solid', 'zigzag', 'cross-hatch', 'dots', 'dashed'];

interface Props {
  value: ShapeStyle;
  onChange: (s: ShapeStyle) => void;
}

export function ColorPicker({ value, onChange }: Props): JSX.Element {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    if (svgRef.current) {
      const canvas = rough.svg(svgRef.current);

      const child = canvas.rectangle(5, 5, 120, 60, {
        ...value,
        fillStyle: value.fillStyle,
      });

      svgRef.current.replaceChildren(child);
    }
  }, [value.fill, value.stroke, value.fillStyle]);

  return (
    <Popover isLazy placement="top-start">
      <PopoverTrigger>
        <Button p="2">
          <Box
            as="span"
            backgroundColor={value.fill}
            borderColor={value.stroke}
            borderWidth={2}
            borderStyle="solid"
            h="20px"
            w="20px"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent minW="max-content">
        <PopoverArrow />
        <PopoverBody>
          <Heading as="h4" fontSize="md">
            填充
          </Heading>
          <HStack justifyContent="flex-start" mt="2">
            <Box
              position="relative"
              h="24px"
              w="24px"
              backgroundColor="gray.100"
              cursor="pointer"
              _hover={{ opacity: 0.8 }}
              onClick={() =>
                onChange({
                  ...value,
                  fill: 'transparent',
                })
              }
              outline={value.fill === 'transparent' ? '1px solid black' : 'none'}
              outlineOffset={2}
            >
              <Box
                position="absolute"
                top="11px"
                left="0"
                h="2px"
                w="100%"
                backgroundColor="red.500"
                transform="rotate(45deg)"
              />
            </Box>
            {colors.map((c) => (
              <Box
                key={c}
                backgroundColor={theme.colors[c][300]}
                h="24px"
                w="24px"
                flexShrink={0}
                cursor="pointer"
                _hover={{
                  opacity: 0.8,
                }}
                onClick={() =>
                  onChange({
                    ...value,
                    fill: theme.colors[c][300],
                  })
                }
                outline={value.fill === theme.colors[c][300] ? '1px solid black' : 'none'}
                outlineOffset={2}
              />
            ))}
          </HStack>
          <Heading as="h4" fontSize="md" mt="2">
            描边
          </Heading>
          <HStack justifyContent="flex-start" mt="2">
            <Box
              position="relative"
              h="24px"
              w="24px"
              backgroundColor="gray.100"
              cursor="pointer"
              _hover={{ opacity: 0.8 }}
              onClick={() =>
                onChange({
                  ...value,
                  stroke: 'transparent',
                })
              }
              outline={value.stroke === 'transparent' ? '1px solid black' : 'none'}
              outlineOffset={2}
            >
              <Box
                position="absolute"
                top="11px"
                left="0"
                h="2px"
                w="100%"
                backgroundColor="red.500"
                transform="rotate(45deg)"
              />
            </Box>
            {colors.map((c) => (
              <Box
                key={c}
                backgroundColor={theme.colors[c][700]}
                h="24px"
                w="24px"
                flexShrink={0}
                cursor="pointer"
                _hover={{
                  opacity: 0.8,
                }}
                onClick={() =>
                  onChange({
                    ...value,
                    stroke: theme.colors[c][700],
                  })
                }
                outline={value.stroke === theme.colors[c][800] ? '1px solid black' : 'none'}
                outlineOffset={2}
              />
            ))}
          </HStack>
          <Heading as="h4" fontSize="md" mt="2">
            效果
          </Heading>
          <ButtonGroup size="sm" isAttached mt="2">
            {fillStyles.map((s) => (
              <Button
                key={s}
                onClick={() => onChange({ ...value, fillStyle: s })}
                colorScheme={value.fillStyle === s ? 'blackAlpha' : 'gray'}
              >
                {s}
              </Button>
            ))}
          </ButtonGroup>

          <Heading as="h4" fontSize="md" mt="2">
            预览
          </Heading>
          <svg ref={svgRef} height="70px" width="100%" />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
