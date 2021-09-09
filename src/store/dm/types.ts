export interface Tracker {
  id: string;
  name: string;
  remain: number;
  max: string;
}

export type DMCharacterType = 'player' | 'npc' | 'enemy';
export interface DMCharacter {
  id: string;
  syncId?: string;
  disabled: boolean;
  name: string;
  type: DMCharacterType;
  hp: string;
  maxHP: string;
  attunement: string;
  initiative: string;
  perception: string;
  senseMotive: string;
  willSave: string;
  rolledInitiative: number;
  rolledPerception: number;
  rolledSenseMotive: number;
  rolledWillSave: number;
  battleOrder: number;
  trackers: Array<Tracker>;
}

export interface PrestigeFaction {
  id: string;
  name: string;
}

export interface PrestigeLevel {
  id: string;
  name: string;
  max: number;
}

export interface PrestigeTemplate {
  name: string;
  levels: string[];
}
