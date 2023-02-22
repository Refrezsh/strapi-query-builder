export function _set<
  Model extends { [key: string]: number | string | boolean | Model | {} }
>(obj: Model, path: string | string[], value: any) {
  const pathArray = (Array.isArray(path)
    ? path
    : path.match(/([^[.\]])+/g)) as unknown as (keyof Model)[];
  if (!pathArray) {
    return obj;
  }

  pathArray.reduce<Model>((acc, key, i) => {
    if (acc[key] === undefined) {
      // @ts-ignore
      acc[key] = {};
    }
    if (i === pathArray.length - 1) acc[key] = value;
    return acc[key] as Model;
  }, obj);

  return obj;
}

export function _union(arr: string[], arr2: string[]) {
  return [...new Set(arr.concat(arr2))];
}

export function _unionBy<Type>(
  callback: (b: Type) => string | number | boolean,
  array1: Type[],
  array2: Type[]
) {
  return [...array1, ...array2].flat().filter(
    (
      (set: Set<string | number | boolean>) => (o) =>
        set.has(callback(o as Type)) ? false : set.add(callback(o as Type))
    )(new Set())
  );
}
