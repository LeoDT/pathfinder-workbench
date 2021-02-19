export interface Entity {
  id: string;
  name: string;
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
