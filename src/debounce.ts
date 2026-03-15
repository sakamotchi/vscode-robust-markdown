export function debounce(fn: () => void, wait: number): () => void {
  let timer: NodeJS.Timeout | undefined;
  return () => {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
    timer = setTimeout(fn, wait);
  };
}
