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
      // @ts-ignore FIXME: Don't know how to fix it yet.
      acc[key] = {};
    }
    if (i === pathArray.length - 1) acc[key] = value;
    return acc[key] as Model;
  }, obj);

  return obj;
}

export function _isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}
