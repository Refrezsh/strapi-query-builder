export const compileStrapiQuery = (
  queryBuilder: {
    build: () => any;
  },
  config?: SerializationConfig
): SerializeOutput => {
  const { data, ...query } = queryBuilder.build();

  const deduplicatedArrays = findDeduplicatedArrays(query);

  return serializeQuery({
    query: query,
    deduplicatedArrays: deduplicatedArrays,
    compileSource: config?.compileSource || "typescript",
  });
};

const serializeQuery = (request: SerializeQueryRequest): SerializeOutput => {
  return {
    query: serializeQueryToTsObjectLiteral(request.query, [], request),
    constants: serializeConstants(request),
  };
};

// <editor-fold desc="Serialize utils>
const serializeQueryToTsObjectLiteral = (
  obj: any,
  path: string[],
  additional: SerializeQueryRequest
) => {
  const compileSource = additional.compileSource;

  if (Array.isArray(obj)) {
    const lastKey = path[path.length - 1];
    const dotted = path.join(".");
    const hasDuplicate = additional.deduplicatedArrays.get(dotted);

    return !!hasDuplicate
      ? hasDuplicate.constantName
      : serializeAnyList(lastKey, obj, compileSource);
  }

  const entries: string = Object.entries(obj)
    .filter(([_, value]) => typeof value !== "function")
    .map(([key, value]) => {
      const safeKey = getSafeKey(key);

      let serializedValue = undefined;

      if (
        typeof value === "boolean" ||
        typeof value === "string" ||
        typeof value === "number"
      ) {
        const serialized = JSON.stringify(value);
        serializedValue =
          compileSource === "typescript"
            ? `${serialized} as ${serialized}`
            : serialized;
      } else if (typeof value === "object" && value !== null) {
        serializedValue = serializeQueryToTsObjectLiteral(
          value,
          [...path, key],
          additional
        );
      } else {
        serializedValue = JSON.stringify(value);
      }

      if (serializedValue === undefined) {
        throw new Error(`Unknown serializer value for key ${safeKey}`);
      }

      return `${safeKey}:${serializedValue}`;
    })
    .join(",");

  return `{${entries}}`;
};

const serializeAnyList = (
  key: string,
  obj: any[],
  source: SerializeQueryRequest["compileSource"]
): string => {
  const selectAndOrderKeys = new Set(["fields", "sort", "select", "orderBy"]);

  if (selectAndOrderKeys.has(key)) {
    const fieldsValues = `[${obj
      .map((value) => JSON.stringify(value))
      .join(",")}]`;

    return source === "typescript"
      ? `${fieldsValues} as ${fieldsValues}`
      : fieldsValues;
  } else {
    return `[${obj
      .map((value) => {
        if (Array.isArray(value)) {
          throw new Error(
            `Query list value for key '${key}' can't be an array`
          );
        }

        return JSON.stringify(value);
      })
      .join(",")}]`;
  }
};

const getSafeKey = (key: string) =>
  isSafeKey(key) ? key : JSON.stringify(key);

const isSafeKey = (key: string): boolean =>
  /^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(key);
// </editor-fold>

// <editor-fold desc="Array deduplicate optimization>
const serializeConstants = (request: SerializeQueryRequest): string => {
  const constantsMap = new Map<string, string>();

  const deduplicatedArrays = request.deduplicatedArrays.values();
  for (const values of deduplicatedArrays) {
    if (!constantsMap.has(values.constantName)) {
      constantsMap.set(
        values.constantName,
        serializeAnyList(
          "fields",
          values.constantArrayValue,
          request.compileSource
        )
      );
    }
  }

  const constantList: string[] = [];
  for (const [key, value] of constantsMap) {
    constantList.push(`const ${key} = ${value};`);
  }

  return constantList.join("");
};

const findDeduplicatedArrays = (query: any) => {
  const selectKeys = new Set(["fields", "select"]);
  const sortKeys = new Set(["sort", "orderBy"]);
  const arraysMap = new Map<string, { value: any[]; paths: string[] }>();

  const traverse = (obj: any, path: string[]): void => {
    if (Array.isArray(obj)) {
      const lastKey = path[path.length - 1];
      const isFieldKey = selectKeys.has(lastKey);
      const isSortKey = sortKeys.has(lastKey);
      if (!isFieldKey && !isSortKey) return;

      const hash = isFieldKey ? getFieldsHash(obj) : getSortsHash(obj);

      if (!arraysMap.has(hash)) {
        arraysMap.set(hash, { value: obj, paths: [] });
      }

      arraysMap.get(hash)!.paths.push(path.join("."));
    } else if (obj && typeof obj === "object") {
      for (const [key, value] of Object.entries(obj)) {
        traverse(value, [...path, key]);
      }
    }
  };

  traverse(query, []);

  const resultHash: RepeatableArraysHash = new Map();
  let counter = 1;

  for (const [_, { value, paths }] of arraysMap) {
    if (paths.length > 1) {
      const constantName = `list${counter++}`;
      for (const p of paths) {
        resultHash.set(p, {
          constantName: constantName,
          constantArrayValue: value,
        });
      }
    }
  }

  return resultHash;
};

const getFieldsHash = (list: any[]) =>
  list
    .sort()
    .map((v) => JSON.stringify(v))
    .join("||");

const getSortsHash = (list: any[]) =>
  list.map((v) => JSON.stringify(v)).join("||");
// </editor-fold>

// <editor-fold desc="Type utils">
type SerializeQueryRequest = {
  query: any;
  deduplicatedArrays: RepeatableArraysHash;
  compileSource: "typescript" | "javascript";
};

interface SerializationConfig {
  compileSource?: SerializeQueryRequest["compileSource"];
}

interface SerializeOutput {
  query: string;
  constants: string;
}

type RepeatableArraysHash = Map<
  string,
  { constantName: string; constantArrayValue: any[] }
>;
// </editor-fold>
