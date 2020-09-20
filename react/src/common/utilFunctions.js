
export const unique = (array, compareFunction = undefined) => {
  if (!compareFunction) {
    return Array.from(new Set(array));
  }
  return array.filter((v, i) => (array.findIndex((v2) => compareFunction(v, v2)) === i));
};

export const sum = (array, getFunction = undefined) => {
  if (!getFunction) {
    return array.reduce((acc, v) => acc + v, 0);
  }
  return array.reduce((acc, v) => acc + getFunction(v), 0);
};
