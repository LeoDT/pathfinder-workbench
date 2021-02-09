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

export interface Spell {
  id: string;
  name: string;
  meta: SpellMeta;
  book: string;
  description: string;
}

export interface Weapon {
  id: string;
  name: string;
}

export type EntityTypes = Spell | Weapon;
