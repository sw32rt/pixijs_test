
/* https://thinkridge.com/modules/xpwiki/?%E6%8A%80%E8%A1%93%E7%B3%BB%E5%82%99%E5%BF%98%E9%8C%B2%2FTypeScript%2F%E4%BA%8C%E5%88%86%E6%8E%A2%E7%B4%A2%28binary%20search%29 */

// lower_bound
export function lowerBound<T, U>(list: T[], value: U,
  less: (l: T, r: U) => boolean = (l: T, r: U) => l as any < r
): number {
  let count = list.length;
  let first = 0;
  while (0 < count) {
      const count2 = count / 2 | 0;
      const mid = first + count2;
      if (less(list[mid], value)) {
          first = mid + 1;
          count -= count2 + 1;
      } else {
          count = count2;
      }
  }
  return first;
}

// upper_bound
export function upperBound<T, U>(list: T[], value: U,
  less: (l: U, r: T) => boolean = (l: U, r: T) => l as any < r
): number {
  return lowerBound(list,value,(l,r)=>!less(r,l));
}

// binary_search
// ・2つの比較関数というのがいささか冗長な気がしています。もう少しスマートな書き方がもしあれば教えてほしいです
export function binarySearch<T, U>(list: T[], value: U,
  less0: (l: T, r: U) => boolean = (l: T, r: U) => l as any < r,
  less1: (l: U, r: T) => boolean = (l: U, r: T) => l as any < r
): boolean {
  const first = lowerBound(list, value, less0);
  return first >= list.length ? false : !less1(value, list[first]);
}