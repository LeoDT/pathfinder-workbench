import { Effect, EffectGainFeat, EffectType } from '../types/effectType';

export function getBonusFeatEffect(effects: Array<Effect>): EffectGainFeat | undefined {
  return effects.find((e): e is EffectGainFeat => e.type === EffectType.gainFeat);
}
