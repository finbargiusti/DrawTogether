export function hashName(name: string): string {
  const charArray = name.split('');

  let res = '';

  charArray.forEach(ch => {
    res += ch.charAt(0) + 4 + ch.charAt(0) + 8;
  });

  return res;
}
