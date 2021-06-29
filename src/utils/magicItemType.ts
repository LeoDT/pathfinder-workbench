import { MagicItemSlot, MagicItemTypeMeta } from '../types/core';
import { schoolTranslates } from './spell';

export const magicItemTypeMetaTranslates: Record<keyof MagicItemTypeMeta, string> = {
  aura: '灵光',
  price: '价格',
  weight: '重量',
  casterLevel: '施法者等级',
  slot: '装备部位',
  group: '类型',
};

export const magicItemSlotTranslates: Record<MagicItemSlot, string> = {
  ring: '戒指',
  belt: '腰部',
  body: '躯体',
  chest: '胸部',
  eyes: '眼部',
  feet: '脚部',
  hand: '手部',
  head: '头部',
  headband: '头饰',
  neck: '颈部',
  shoulders: '肩部',
  wrists: '腕部',
  none: '无位置',
};

export function translateMagicItemAura(aura: string): string {
  let result = aura
    .replace('(no school)', '')
    .replace('none (see text)', '无')
    .replace('and', '')
    .replace('or', '或')
    .replace('(if miracle is used)', '(若被使用)')
    .replace(',', '')
    .replace('strong', '强烈')
    .replace('moderate', '中等')
    .replace('faint', '微弱')
    .replace('[evil]', '[邪恶]')
    .replace('[good]', '[善良]')
    .replace(/varie[sd]/, '可变')
    .replace('school based on cloak type', '可变');

  for (const [k, v] of Object.entries(schoolTranslates)) {
    result = result.replace(k, v);
  }

  return result.replaceAll('学派', '').replaceAll(' ', '');
}
