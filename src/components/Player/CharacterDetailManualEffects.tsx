import yaml from 'js-yaml';
import { toJS } from 'mobx';
import { useEffect, useRef, useState } from 'react';

import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { EditorState, EditorView, basicSetup } from '@codemirror/basic-setup';
import { indentMore } from '@codemirror/commands';
import { yaml as CodeMirrorYAMLMode } from '@codemirror/legacy-modes/mode/yaml';
import { StreamLanguage } from '@codemirror/stream-parser';
import { keymap } from '@codemirror/view';

import { validateManualEffects } from '../../utils/effect';
import { useCurrentCharacter } from './context';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function CharacterDetailManualEffects({ value, onChange }: Props): JSX.Element {
  const cmWrapperRef = useRef<HTMLDivElement>(null);
  const cmRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (cmWrapperRef.current && !cmRef.current) {
      cmRef.current = new EditorView({
        state: EditorState.create({
          doc: value || '\n\n\n\n',
          extensions: [
            basicSetup,
            keymap.of([{ key: 'Tab', run: indentMore }]),
            EditorState.tabSize.of(2),
            StreamLanguage.define(CodeMirrorYAMLMode),
            EditorView.updateListener.of((v) => {
              if (v.docChanged) {
                onChange(v.state.doc.toJSON().join('\n'));
              }
            }),
            EditorView.theme({
              '&': { height: '60vh' },
              '.cm-scroller': { overflow: 'auto' },
            }),
          ],
        }),
        parent: cmWrapperRef.current,
      });
    }

    return () => {
      cmRef.current?.destroy();
      cmRef.current = null;
    };
  }, []);

  useEffect(() => {
    cmRef.current?.update([
      cmRef.current.state.update({
        changes: {
          from: 0,
          to: cmRef.current.state.doc.length,
          insert: value,
        },
      }),
    ]);
  }, [value]);

  return <div ref={cmWrapperRef} />;
}

const SHORTCUTS = [
  {
    name: '能力奖励',
    text: `
- name: 能力奖励
  effects:
    - type: abilityBonus
      args:
        abilityType: dex
        bonus:
          amount: 2
          type: untyped
`,
  },
  {
    name: '技能奖励',
    text: `
- name: 技能奖励
  effects:
    - type: gainSkill
      args:
        skillId: survival
        bonus:
          amount: 1
          type: untyped
`,
  },
  {
    name: 'AC奖励',
    text: `
- name: AC奖励
  effects:
    - type: gainAC
      args:
        bonus:
          amount: 1
          type: untyped
`,
  },
];

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CharacterDetailManualEffectsModal({ isOpen, onClose }: ModalProps): JSX.Element {
  const character = useCurrentCharacter();
  const [value, setValue] = useState(() =>
    character.manualEffects.length ? yaml.dump(toJS(character.manualEffects)) : ''
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>管理手动效果</ModalHeader>
        <ModalBody>
          <CharacterDetailManualEffects value={value} onChange={(v) => setValue(v)} />

          <HStack>
            {SHORTCUTS.map(({ name, text }) => (
              <Text
                key={name}
                onClick={() => {
                  setValue([value, text].join(''));
                }}
                color="blue.500"
                cursor="pointer"
                _hover={{
                  textDecoration: 'underline',
                }}
              >
                {name}
              </Text>
            ))}
          </HStack>
        </ModalBody>
        <ModalFooter>
          <HStack>
            <Button onClick={() => onClose()}>取消</Button>
            <Button
              colorScheme="teal"
              onClick={() => {
                const effects = validateManualEffects(yaml.load(value));

                if (effects) {
                  character.manualEffects = effects;

                  onClose();
                } else {
                  alert('手动效果验证未通过');
                }
              }}
            >
              确认
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
