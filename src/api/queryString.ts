type QueryValue = string | number | string[] | undefined;

export function buildMangaDexQuery(params: Record<string, QueryValue>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }
    if (Array.isArray(value)) {
      // Key sudah membawa "[]" sendiri di titik pemanggilan (mis.
      // 'includes[]') — jangan ditambah lagi di sini, atau MangaDex akan
      // menerima "includes[][]" dan menolaknya dengan 400 validation_exception.
      for (const item of value) {
        search.append(key, item);
      }
    } else {
      search.append(key, String(value));
    }
  }

  const queryString = search.toString();
  return queryString ? `?${queryString}` : '';
}
