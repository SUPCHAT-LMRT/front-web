export const unproxify = (val: Array<unknown>) => {
  if (val instanceof Array) return val.map(unproxify);
  if (val instanceof Object)
    return Object.fromEntries(
      Object.entries(Object.assign({}, val)).map(([k, v]) => [k, unproxify(v)]),
    );
  return val;
};
