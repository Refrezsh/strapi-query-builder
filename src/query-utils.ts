export function _set<
  Model extends { [key: string]: number | string | boolean | Model | {} }
>(obj: Model, path: string | string[], value: any) {
  const pathArray: (keyof Model)[] = Array.isArray(path)
    ? path
    : (path.split(".").filter(Boolean) as (keyof Model)[]);

  let current: any = obj;

  for (let i = 0; i < pathArray.length; i++) {
    const key = pathArray[i];

    if (i === pathArray.length - 1) {
      current[key] = value;
    } else {
      if (typeof current[key] !== "object" || current[key] === null) {
        current[key] = {};
      }
      current = current[key];
    }
  }

  return obj;
}

export function _isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}
