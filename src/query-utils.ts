export const _set = <
  Model extends { [key: string]: number | string | boolean | Model | {} }
>(
  obj: Model,
  path: string,
  value: any
): Model => {
  const keys: (keyof Model)[] = path.split(".") as (keyof Model)[];

  let current: any = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (typeof current[key] !== "object" || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;

  return obj;
};

export const _isDefined = <T>(value: T | undefined | null): value is T =>
  value !== undefined && value !== null;
