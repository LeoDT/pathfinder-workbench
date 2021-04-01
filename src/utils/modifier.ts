export function showModifier(mod: number): string {
  return `${mod < 0 ? '' : '+'}${mod}`;
}
