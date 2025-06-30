export const getDeclination = (decl, words) => {
  if (words) {
    const count = Math.floor(decl);
    // массив элементов, которые соответствуют разным вариантам склонения слова в русском языке
    const cases = [2, 0, 1, 1, 1, 2];
    const index =
      count % 100 > 4 && count % 100 < 20 ? 2 : cases[Math.min(count % 10, 5)];
    return `${count} ${words[index]}`;
  }
  return null;
};
