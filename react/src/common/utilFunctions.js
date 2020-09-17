
export const unique = (array, compareFunction = undefined) => {
  if (!compareFunction) {
    return Array.from(new Set(array));
  }
  return array.filter((v, i) => (array.findIndex(v2 => compareFunction(v, v2)) === i));
};
