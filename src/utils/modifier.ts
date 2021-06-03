export function showModifier(mod: number): string {
  return `${mod < 0 ? '' : '+'}${mod}`;
}

export function showModifiers(mod: number[]): string {
  return mod.map((m) => showModifier(m)).join('/');
}
