export interface Condition {
  level: string;
  armor: string | string[] | 'none';
  shield: string | string[] | 'none';
  load: 'light' | 'medium' | 'heavy';
}
