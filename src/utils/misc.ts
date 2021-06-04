export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 3) - hash);
  }

  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).substr(-2);
  }

  return color;
}

export function showDistance(d: number): string {
  return `${d} 尺`;
}

export function showWeight(w: number): string {
  return `${w} 磅`;
}

export function uniqByLast<T>(arr: Array<T>, iter: (v: T) => unknown): Array<T> {
  const map = new Map<unknown, T>();

  for (const item of arr) {
    const i = iter(item);

    map.set(i, item);
  }

  return Array.from(map.values());
}
