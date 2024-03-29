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

export function showDice(d: number, n?: number): string {
  return `${n ? n : ''}d${d}`;
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

export function takeByIndexes<T>(arr: T[], indexes: number[]): T[] {
  const r: T[] = [];

  for (const i of indexes) {
    r.push(arr[i]);
  }

  return r;
}

export function stringToBlobUrl(content: string): string {
  const blob = new Blob([content]);

  return URL.createObjectURL(blob);
}

export function download(url: string, name: string): void {
  const a = document.createElement('a');
  a.setAttribute('download', name);
  a.setAttribute('href', url);
  a.style.position = 'absolute';

  document.body.append(a);

  a.click();

  document.body.removeChild(a);
}

export async function readFileAsString(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', (e) => {
      resolve(e.target?.result as string);
    });

    reader.addEventListener('error', () => {
      reject(reader.error);
    });

    reader.readAsText(file);
  });
}

export function nonConflictName(name: string, all: string[]): string {
  const existed = all.filter((s) => s.startsWith(name));

  return `${name}${existed.length > 0 ? ` ${existed.length + 1}` : ''}`;
}
