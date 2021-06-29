export type CarryLoad = 'light' | 'medium' | 'heavy' | 'overload';
export type Carry = [number, number, number];

export const CARRY: Array<Carry> = [
  [3, 6, 10],
  [6, 13, 20],
  [10, 20, 30],
  [13, 26, 40],
  [16, 33, 50],
  [20, 40, 60],
  [23, 46, 70],
  [26, 53, 80],
  [30, 60, 90],
  [33, 66, 100],
  [38, 76, 115],
  [43, 86, 130],
  [50, 100, 150],
  [58, 116, 175],
  [66, 133, 200],
  [76, 153, 230],
  [86, 173, 260],
  [100, 200, 300],
  [116, 233, 350],
  [133, 266, 400],
  [153, 306, 460],
  [173, 346, 520],
  [200, 400, 600],
  [233, 466, 700],
  [266, 533, 800],
  [306, 613, 920],
  [346, 693, 1040],
  [400, 800, 1200],
  [466, 933, 1400],
];

export function getCarryForSTR(str: number): Carry {
  if (str <= 29) {
    return CARRY[str];
  }

  const use20 = (str % 30) + 20;
  const multiplier = Math.pow(4, Math.floor(str / 30));

  return [CARRY[use20][0] * multiplier, CARRY[use20][1] * multiplier, CARRY[use20][2] * multiplier];
}

export function getCarryLoad(str: number, weight: number): CarryLoad {
  const carry = getCarryForSTR(str);

  if (weight < carry[0]) return 'light';
  if (weight < carry[1]) return 'medium';
  if (weight < carry[2]) return 'heavy';

  return 'overload';
}

export const carryLoadTranslates: Record<CarryLoad, string> = {
  light: '轻载',
  medium: '中载',
  heavy: '重载',
  overload: '超载',
};
