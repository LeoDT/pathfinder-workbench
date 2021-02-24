export enum AbilityType {
  str = 'str',
  dex = 'dex',
  con = 'con',
  int = 'int',
  wis = 'wis',
  cha = 'cha',
}

export interface Abilities {
  [AbilityType.str]: number;
  [AbilityType.dex]: number;
  [AbilityType.con]: number;
  [AbilityType.int]: number;
  [AbilityType.wis]: number;
  [AbilityType.cha]: number;
}

export interface Entity {
  id: string;
  name: string;
}

export interface Race extends Entity {
  ability: Partial<Abilities>;
}

export interface Class extends Entity {
  hd: number;
}

export interface SpellMeta {
  school?: string;
  level?: string;
  castingTime?: string;
  components?: string;
  effect?: string;
  area?: string;
  target?: string;
  aiming?: string;
  duration?: string;
  saving?: string;
  resistance?: string;
}

export interface Spell extends Entity {
  meta: SpellMeta;
  book: string;
  description: string;
}

export interface FeatMeta {
  requirement?: string;
  benefit?: string;
  special?: string;
  normal?: string;
}

export interface Feat extends Entity {
  meta: FeatMeta;
  book: string;
  brief: string;
  description?: string;
}

export type Weapon = Entity;
