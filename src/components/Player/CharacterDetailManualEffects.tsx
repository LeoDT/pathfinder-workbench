import yaml from 'js-yaml';
import { toJS } from 'mobx';
import { useEffect, useRef, useState } from 'react';

import {
  Box,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
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

  return <div ref={cmWrapperRef} />;
}

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
