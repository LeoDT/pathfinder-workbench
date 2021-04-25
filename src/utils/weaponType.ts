import { WeaponCategory, WeaponDamageType, WeaponTraining, WeaponTypeMeta } from '../types/core';

export const weaponTypeMetaTranslates: Record<keyof WeaponTypeMeta, string> = {
  training: '训练',
  category: '类型',
  cost: '价格',
  damage: '中型伤害',
  critical: '重击',
  range: '射程',
  weight: '重量',
  damageType: '伤害类型',
  special: '特性',
  bothHand: '两手使用',
};

export const weaponTrainingTranslates: Record<WeaponTraining, string> = {
  simple: '简易武器',
  martial: '军用武器',
  exotic: '异种武器',
};

export const weaponCategoryTranslates: Record<WeaponCategory, string> = {
  'unarmed attacks': '徒手',
  light: '轻型武器',
  'one-handed': '单手武器',
  'two-handed': '双手武器',
  ranged: '远程武器',
};

export function translateWeaponTypeMetaDamageType(dt: WeaponDamageType): string {
  return dt
    .replace('P', '穿刺')
    .replace('B', '钝击')
    .replace('S', '挥砍')
    .replace(' or ', '或')
    .replace(' and ', '和');
}

export const weaponSpecialTranslates: Record<string, string> = {
  nonlethal: '非致命',
  fragile: '易碎',
  monk: '武僧',
  attached: '手臂',
  disarm: '卸武',
  tool: '工具',
  trip: '绊摔',
  brace: '迎击',
  reach: '长武',
  grapple: '擒抱',
  double: '双头',
  performance: '演武',
  improvised: '临时',
  blocking: '格挡',
  finesse: '灵巧',
  sunder: '破武',
  distracting: '虚实',
  'see text': '见描述',
};
