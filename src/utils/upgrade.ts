import { FavoredClassBonus } from '../types/characterUpgrade';
import { SelectOptions } from '../types/misc';

export const gainFeatReasonTranslates = {
  level: '升级',
  race: '种族奖励',
  class: '职业奖励',
};

export const favoredClassBonusOptions = [
  { text: '生命值+1', value: 'hp' },
  { text: '技能点数+1', value: 'skill' },
  { text: '其它', value: 'custom' },
] as SelectOptions<FavoredClassBonus>;
