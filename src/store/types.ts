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

export interface Entity {
  id: string;
  name: string;
}

export interface Spell extends Entity {
  id: string;
  name: string;
  meta: SpellMeta;
  book: string;
  description: string;
}

export interface Weapon extends Entity {
  id: string;
  name: string;
}
