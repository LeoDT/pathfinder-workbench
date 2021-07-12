/* eslint-disable react/jsx-key */
import { useEffect, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaFileArchive } from 'react-icons/fa';

import {
  Button,
  Icon,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';

import { useStore } from '../../store';
import { Character } from '../../store/character';
import { Attack } from '../../store/character/attack';
import { Class, NamedBonus, Weapon } from '../../types/core';
import { ABILITY_TYPES, abilityTranslates } from '../../utils/ability';
import { alignmentTranslates } from '../../utils/alignment';
import { showCoin } from '../../utils/coin';
import { showEquipment } from '../../utils/equipment';
import { showWeight } from '../../utils/misc';
import { showModifier } from '../../utils/modifier';
import { sizeTranslates } from '../../utils/race';
import { getCarryForSTR } from '../../utils/weight';

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export function characterAsMarkdown(c: Character, collections: any): Array<string | JSX.Element> {
  const bonusToString = (bonuses: NamedBonus[]) => {
    return bonuses
      .map(
        ({ name, bonus }) =>
          `${name}${
            Array.isArray(bonus.amount) ? bonus.amount.join('/') : showModifier(bonus.amount)
          }`
      )
      .join(', ');
  };
  const getAttacks = () => {
    let attacks: Attack[] = c.attack.attacks;
    const holding = c.equipment.mainHand;

    attacks = [
      ...attacks,
      ...c.equipment.storage
        .filter((e): e is Weapon => e.equipmentType === 'weapon')
        .map((w) => {
          c.equipment.hold(w);

          return c.attack.attacks;
        })
        .flat(),
    ];

    if (holding) {
      c.equipment.hold(holding, 'main');
    } else {
      c.equipment.unhold('main');
    }

    return attacks;
  };
  const getSkillPoints = () => {
    const allFromClass = new Map<Class, number>();
    let allFromFavoredClass = 0;
    const fromInt = c.abilityModifier.int * c.level;

    c.upgrades.forEach((u) => {
      const clas = collections.class.getById(u.classId);
      const fromClass = clas.skillPoints / Math.floor(c.skillSystem === 'core' ? 1 : 2);
      const favoredClassBonus = u.favoredClassBonus === 'skill' ? 1 : 0;

      allFromClass.set(clas, (allFromClass.get(clas) ?? 0) + fromClass);
      allFromFavoredClass += favoredClassBonus;
    });

    return c.makeNamedBonuses(
      (
        [
          ...Array.from(allFromClass.entries()).map(([clas, number]) => ({
            name: `${clas.name}等级`,
            bonus: { amount: number, type: 'untyped' },
          })),
          allFromFavoredClass
            ? { name: '天生职业奖励', bonus: { amount: allFromFavoredClass, type: 'untyped' } }
            : null,
          fromInt
            ? { name: '智力', bonus: { amount: c.abilityModifier.int * c.level, type: 'untyped' } }
            : null,
        ] as Array<NamedBonus | null>
      ).filter((i): i is NamedBonus => Boolean(i))
    );
  };
  const getSkills = () => {
    const col = c.skillSystem === 'core' ? collections.coreSkill : collections.consolidatedSkill;
    const skills = Array.from(c.skillRanks.keys()).map((s) => col.getById(s));

    return skills.map((s) => ({
      skill: s,
      total: c.getSkillDetail(s).total,
      rank: c.skillRanks.get(s.id),
      bonuses: c.skillBonuses.get(s.id),
    }));
  };

  const skillPoints = getSkillPoints();

  return [
    '## 基础',
    <table>
      <tbody>
        <tr>
          <td>姓名</td>
          <td>{c.name}</td>
          <td>职业</td>
          <td>{c.levelDetailForShow}</td>
        </tr>
        <tr>
          <td>阵营</td>
          <td>{alignmentTranslates[c.alignment]}</td>
          <td>信仰</td>
          <td>{c.deity || '无'}</td>
        </tr>
        <tr>
          <td>体型</td>
          <td>{sizeTranslates[c.race.size]}</td>
          <td>性别</td>
          <td>未定义</td>
        </tr>
        <tr>
          <td>种族</td>
          <td>{c.race.name}</td>
          <td>速度</td>
          <td>
            {c.status.speed}({bonusToString(c.status.speedBonuses)})
          </td>
        </tr>
      </tbody>
    </table>,
    <table>
      <thead>
        <tr>
          <th />
          <th>属性</th>
          <th>调整值</th>
          <th>初始属性</th>
          <th>属性调整</th>
        </tr>
      </thead>
      <tbody>
        {ABILITY_TYPES.map((a) => (
          <tr key={a}>
            <td>{abilityTranslates[a]}</td>
            <td>{c.ability[a]}</td>
            <td>{showModifier(c.abilityModifier[a])}</td>
            <td>{c.baseAbility[a]}</td>
            <td>{bonusToString(c.getBonusesForAbilityType(a, false))}</td>
          </tr>
        ))}
      </tbody>
    </table>,
    '## 进攻',
    <table>
      <tbody>
        <tr>
          <td>BAB</td>
          <td>{c.status.bab.join('/')}</td>
          <td>先攻</td>
          <td>
            {c.status.initiative}({bonusToString(c.status.initiativeBonuses)})
          </td>
        </tr>
        <tr>
          <td>CMB</td>
          <td>
            {c.status.cmb}({bonusToString(c.status.cmbBonuses)})
          </td>
          <td>CMD</td>
          <td>
            {c.status.cmd}({bonusToString(c.status.cmdBonuses)})
          </td>
        </tr>
      </tbody>
    </table>,
    <table>
      <thead>
        <tr>
          <th>武器</th>
          <th>攻击加值</th>
          <th>伤害</th>
          <th>备注</th>
        </tr>
      </thead>
      <tbody>
        {getAttacks().map((a, i) => (
          <tr key={i}>
            <td>{a.option.name}</td>
            <td>
              {a.attackModifier.join('/')}({bonusToString(a.attackBonuses)})
            </td>
            <td>
              {a.option.damage}
              {showModifier(a.damageModifier)}({bonusToString(a.damageBonuses)})
            </td>
            <td />
          </tr>
        ))}
      </tbody>
    </table>,
    '## 防御',
    <table>
      <tbody>
        <tr>
          <td>HP</td>
          <td>
            {c.status.hp}({bonusToString(c.status.hpBonuses)})
          </td>
        </tr>
        <tr>
          <td>AC</td>
          <td>
            {c.status.ac}({bonusToString(c.status.acBonuses)})
          </td>
        </tr>
        <tr>
          <td>措手不及</td>
          <td>
            {c.status.flatFooted}({bonusToString(c.status.flatFootedBonuses)})
          </td>
        </tr>
        <tr>
          <td>接触</td>
          <td>
            {c.status.touch}({bonusToString(c.status.touchBonuses)})
          </td>
        </tr>
      </tbody>
    </table>,
    <table>
      <tbody>
        <tr>
          <td>强韧</td>
          <td>
            {c.status.fortitude}({bonusToString(c.status.fortitudeBonuses)})
          </td>
        </tr>
        <tr>
          <td>反射</td>
          <td>
            {c.status.reflex}({bonusToString(c.status.reflexBonuses)})
          </td>
        </tr>
        <tr>
          <td>意志</td>
          <td>
            {c.status.will}({bonusToString(c.status.willBonuses)})
          </td>
        </tr>
      </tbody>
    </table>,
    '## 种族特性',
    c.racialTraits.map((t) => `**${t.name}(${t.id})**: ${t.desc.trim()}`).join('\n\n') + '\n',
    ...Array.from(c.allGainedClassFeats.entries())
      .map(([clas, feats]) => {
        return [
          `## ${clas.name}职业特性`,
          feats.map((f) => `**${f.name}(${f.id})**: ${f.desc?.trim()}`).join('\n\n') + '\n',
        ] as string[];
      })
      .flat(),
    '## 天赋职业',
    <table>
      <thead>
        <tr>
          <td>等级</td>
          <td>奖励</td>
        </tr>
      </thead>
      <tbody>
        {c.upgrades.map((u, i) => (
          <tr key={i}>
            <td>{i + 1}</td>
            <td>
              {u.favoredClassBonus === 'hp'
                ? 'HP'
                : u.favoredClassBonus === 'skill'
                ? '技能点'
                : '自定义'}
            </td>
          </tr>
        ))}
        <tr>
          <td>总计</td>
          <td>
            {(() => {
              const a = c.upgrades
                .map((u) => u.favoredClassBonus)
                .reduce(
                  (acc, i) => {
                    if (i === 'hp') {
                      return [acc[0] + 1, acc[1]];
                    }

                    if (i === 'skill') {
                      return [acc[0], acc[1] + 1];
                    }

                    return acc;
                  },
                  [0, 0]
                );

              return [a[0] ? `+${a[0]}HP` : '', a[1] ? `+${a[1]}技能点` : '']
                .filter((i) => i)
                .join(', ');
            })()}
          </td>
        </tr>
      </tbody>
    </table>,
    '## 专长',
    c.gainedFeats.map((f) => `**${f.name}(${f.id})**: ${f.meta.benefit?.trim()}`).join('\n\n') +
      '\n',
    '## 技能',
    `技能点数${c.aggregateNamedBonusesMaxAmount(skillPoints)} (${bonusToString(skillPoints)})\n`,
    <table>
      <thead>
        <tr>
          <th>技能</th>
          <th>调整值</th>
          <th>技能等级</th>
          <th>其他加值</th>
        </tr>
      </thead>
      <tbody>
        {getSkills().map(({ skill, rank, total, bonuses }) => (
          <tr key={skill.id}>
            <td>{skill.name}</td>
            <td>{showModifier(total)}</td>
            <td>{rank}</td>
            <td>{bonusToString(bonuses ?? [])}</td>
          </tr>
        ))}
      </tbody>
    </table>,
    ...c.spellbooks
      .map((book) => [
        `## ${book.class.name}法术`,
        <table>
          <thead>
            <tr>
              <th>环位</th>
              <th>每日法术</th>
              <th>法术列表</th>
            </tr>
          </thead>
          <tbody>
            {book.knownSpells.map((spells, level) => (
              <tr key={level}>
                <td>{level}环</td>
                <td>{book.spellsPerDay[level]}</td>
                <td>{spells.map((s) => s.name).join(',')}</td>
              </tr>
            ))}
          </tbody>
        </table>,
      ])
      .flat(),
    '## 装备',
    `总价值: ${showCoin(c.equipment.storageCostWeight.cost)}, 总重量: ${showWeight(
      c.equipment.storageCostWeight.weight
    )}, 负重: ${getCarryForSTR(c.ability.str).join('/')}\n`,
    <table>
      <thead>
        <tr>
          <th>装备</th>
          <th>价格</th>
          <th>重量</th>
          <th>备注</th>
        </tr>
      </thead>
      <tbody>
        {c.equipment.storageWithCostWeight.map(({ e, cost, weight }) => (
          <tr key={e.id}>
            <td>{showEquipment(e)}</td>
            <td>{showCoin(cost)}</td>
            <td>{showWeight(weight)}</td>
            <td />
          </tr>
        ))}
      </tbody>
    </table>,
  ];
}

interface Props {
  character: Character;
}

export function CharacterAsMarkdownModal({ character }: Props): JSX.Element {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [markdown, setMarkdown] = useState('');
  const { collections } = useStore();

  useEffect(() => {
    if (isOpen) {
      (async () => {
        const prettier = await import('prettier/esm/standalone');
        const parserHTML = await import('prettier/esm/parser-html');

        setMarkdown(
          characterAsMarkdown(character, collections)
            .map((i) => {
              if (typeof i === 'string') {
                if (i.startsWith('#')) {
                  return `${i}\n`;
                }

                return i;
              }

              return prettier.default.format(renderToStaticMarkup(i), {
                parser: 'html',
                plugins: [parserHTML.default],
              });
            })
            .join('\n')
        );
      })();
    }
  }, [isOpen, character]);

  return (
    <>
      <IconButton
        aria-label="导出Markdown"
        title="导出Markdown"
        size="sm"
        icon={<Icon as={FaFileArchive} />}
        onClick={() => {
          onOpen();
        }}
      />

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />

        <ModalContent>
          <ModalHeader>导出Markdown</ModalHeader>
          <ModalBody>
            {isOpen ? (
              <Textarea
                value={markdown}
                isReadOnly
                onClick={(e) => {
                  (e.target as HTMLTextAreaElement).select();
                }}
                rows={10}
              />
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => onClose()}>OK</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
