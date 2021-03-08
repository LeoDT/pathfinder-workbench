import { Effect, EffectGainFeat, EffectType } from '../store/effectTypes';

export function getBonusFeatEffect(effects: Array<Effect>): EffectGainFeat | undefined {
  return effects.find((e): e is EffectGainFeat => e.type === EffectType.gainFeat);
}
