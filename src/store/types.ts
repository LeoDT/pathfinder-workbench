export enum Alignment {
  LG = 'LG',
  NG = 'NG',
  CG = 'CG',
  LN = 'LN',
  N = 'N',
  CN = 'CN',
  LE = 'LE',
  NE = 'NE',
  CE = 'CE',
}

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

export interface Skill extends Entity {
  ability: AbilityType;
  category?: boolean;
  parent?: string;
}

export interface RacialTrait extends Entity {
  desc?: string;
}
export interface Race extends Entity {
  ability: Partial<Abilities>;
  racialTrait: Array<RacialTrait>;
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
  desc: string;
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
  desc?: string;
}

export interface ClassFeat extends Entity {
  desc: string;
}

export interface ClassProficiencies {
  weapon: Array<'simple' | 'martial' | string>;
  armor?: Array<'light' | 'medium' | 'heavy' | 'shield' | string>;
}

export interface ClassLevel {
  level: number;
  bab: Array<number>;
  fortitude: number;
  reflex: number;
  will: number;
  special?: Array<string>;
  spellsPerDay?: Array<number>;
}

export interface Class extends Entity {
  hd: number;
  classSkills: Array<string>;
  skillPoints: number;
  proficiencies: ClassProficiencies;
  feats: Array<ClassFeat>;
  levels: Array<ClassLevel>;
}

export type Weapon = Entity;

export interface CharacterUpgrade {
  classId: string;
  skills: Map<string, number>;
  abilities?: Partial<Abilities>;
  feats?: Array<string>; //feat id
  spells?: Map<number, string>; //spell level & spell id

  gainFeat: number;
  gainAbility: number;
}
