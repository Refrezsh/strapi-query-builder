import { _set } from "./query-utils";

export default class EQBuilder<
  Model extends object,
  Data extends object = {},
  Config extends object = {}
> {
  private _query: QueryRawInfo<Model, Data> = {
    sort: new Map(),
    fields: new Set(),
  };

  constructor() {}

  //<editor-fold desc="Fields">
  /**
   * @description Select specific fields
   * @description Same keys will be merged
   * @example new EQBuilder<Model>().fields(["name", "type"]); // Produce { fields: ["name", "type"] }
   * @param {StrapiSingleFieldInput[]} fields List of fields keys
   * @return {EQBuilder} This builder
   */
  public fields<
    F extends readonly [
      StrapiSingleFieldInput<Model>,
      ...StrapiSingleFieldInput<Model>[]
    ]
  >(
    fields: F
  ): EQBuilder<
    Model,
    Data,
    Config extends { fields: infer ExistingFields }
      ? {
          fields: Deduplicate<
            [
              ...(ExistingFields extends readonly unknown[]
                ? ExistingFields
                : []),
              ...F
            ]
          >;
        }
      : { fields: Deduplicate<[...F]> }
  > {
    fields.forEach((f) => this._query.fields.add(f));

    return this as unknown as EQBuilder<
      Model,
      Data,
      Config extends { fields: infer ExistingFields }
        ? {
            fields: Deduplicate<
              [
                ...(ExistingFields extends readonly unknown[]
                  ? ExistingFields
                  : []),
                ...F
              ]
            >;
          }
        : { fields: Deduplicate<[...F]> }
    >;
  }

  /**
   * @description Select specific field
   * @description Same keys will be merged
   * @example new EQBuilder<Model>().field("key"); // Produce { fields: ["key"] }
   * @param {StrapiSingleFieldInput} field Field key
   * @return {EQBuilder} This builder
   */
  public field<F extends StrapiSingleFieldInput<Model>>(
    field: F
  ): EQBuilder<
    Model,
    Data,
    Config extends { fields: infer ExistingFields }
      ? {
          fields: Deduplicate<
            [
              ...(ExistingFields extends readonly unknown[]
                ? ExistingFields
                : []),
              F
            ]
          >;
        }
      : { fields: [F] }
  > {
    this._query.fields.add(field);

    return this as unknown as EQBuilder<
      Model,
      Data,
      Config extends { fields: infer ExistingFields }
        ? {
            fields: Deduplicate<
              [
                ...(ExistingFields extends readonly unknown[]
                  ? ExistingFields
                  : []),
                F
              ]
            >;
          }
        : { fields: [F] }
    >;
  }
  //</editor-fold>

  //<editor-fold desc="Sorts">
  /**
   * @description Add ascending sort key
   * @description Same keys will be merged
   * @param {SortKey} sortKey Sort key
   * @example new EQBuilder<Model>().sortAsc("key"); // Produce: { sort: [{"key": "asc"}] }
   * @example new EQBuilder<Model>().sortAsc("parentKey.childKey"); // Produce: { sort: [{"parentKey": { "childKey": "asc" }}] }
   * @return EQBuilder
   */
  public sortAsc<K extends SortKey<Model>>(
    sortKey: K
  ): EQBuilder<
    Model,
    Data,
    Config extends { sort: infer ExistingSorts }
      ? {
          sort: Deduplicate<
            [
              ...(ExistingSorts extends readonly unknown[]
                ? ExistingSorts
                : []),
              TransformNestedKey<K, "asc">
            ]
          >;
        }
      : { sort: [TransformNestedKey<K, "asc">] }
  > {
    this._query.sort.set(sortKey, "asc");

    return this as unknown as EQBuilder<
      Model,
      Data,
      Config extends { sort: infer ExistingSorts }
        ? {
            sort: Deduplicate<
              [
                ...(ExistingSorts extends readonly unknown[]
                  ? ExistingSorts
                  : []),
                TransformNestedKey<K, "asc">
              ]
            >;
          }
        : { sort: [TransformNestedKey<K, "asc">] }
    >;
  }

  /**
   * @description Add ascending sort keys
   * @description Same keys will be merged
   * @param {SortKey[]} sortKeys List of sort keys
   * @example new EQBuilder<Model>().sortsAsc(["key1", "key2"]); // Produce: { sort: [{"key1": "asc"}, {"key2": "asc"}] }
   * @example new EQBuilder<Model>().sortsAsc(["parentKey.childKey", "anotherKey"]); // Produce: { sort: [{"parentKey": { "childKey": "asc" }}, {"anotherKey": "asc"}] }
   * @return EQBuilder
   */
  public sortsAsc<K extends readonly [SortKey<Model>, ...SortKey<Model>[]]>(
    sortKeys: K
  ): EQBuilder<
    Model,
    Data,
    Config extends { sort: infer ExistingSorts }
      ? {
          sort: Deduplicate<
            [
              ...(ExistingSorts extends readonly unknown[]
                ? ExistingSorts
                : []),
              ...TransformNestedKeys<K, "asc">
            ]
          >;
        }
      : { sort: Deduplicate<TransformNestedKeys<K, "asc">> }
  > {
    sortKeys.forEach((key) => {
      this._query.sort.set(key, "asc");
    });

    return this as unknown as EQBuilder<
      Model,
      Data,
      Config extends { sort: infer ExistingSorts }
        ? {
            sort: Deduplicate<
              [
                ...(ExistingSorts extends readonly unknown[]
                  ? ExistingSorts
                  : []),
                ...TransformNestedKeys<K, "asc">
              ]
            >;
          }
        : { sort: Deduplicate<TransformNestedKeys<K, "asc">> }
    >;
  }
  //</editor-fold>

  public build() {
    const builtQuery: any = {};

    if (this._query.fields.size > 0) {
      builtQuery.fields = Array.from(this._query.fields);
    }

    if (this._query.sort.size > 0) {
      builtQuery.sort = EQBuilder._parseSort(this._query.sort);
    }

    return builtQuery as Config;
  }

  private static _parseSort<Md extends object>(sorts: StrapiSorts<Md>) {
    const sortQuery: any[] = new Array(sorts.size);

    let index = 0;
    for (const { 0: key, 1: order } of sorts) {
      sortQuery[index] = _set({}, key, order);
      index++;
    }

    return sortQuery;
  }
}

// <editor-fold desc="Field types">
type StrapiSingleFieldInput<Model extends object> = GetStrictOrWeak<
  Model,
  GetAttributes<Model>,
  GetAttributes<Model> | string
>;

type StrapiFields<Model extends object> = Set<StrapiSingleFieldInput<Model>>;
// </editor-fold>

// <editor-fold desc="Sort types">
type StrapiSortOptions = "desc" | "asc";

type SortKey<Model extends object> = GetStrictOrWeak<
  Model,
  FieldPath<Model>,
  FieldPath<Model> | string
>;

type StrapiSorts<Model extends object> = Map<SortKey<Model>, StrapiSortOptions>;
// </editor-fold>

// <editor-fold desc="Query shapes">
interface QueryRawInfo<Model extends object, Data extends object> {
  sort: StrapiSorts<Model>;
  fields: StrapiFields<Model>;
}
// </editor-fold>

// <editor-fold desc="Input type check utils">
type Primitive = null | undefined | string | number | boolean | symbol | bigint;

type IsTuple<T extends ReadonlyArray<any>> = number extends T["length"]
  ? false
  : true;

type TupleKey<T extends ReadonlyArray<any>> = Exclude<keyof T, keyof any[]>;

type IsSameType<T1, T2> = T1 extends T2 ? true : false;

type PathImpl<
  Key extends string | number,
  Value,
  BaseType
> = Value extends Primitive
  ? `${Key}`
  : IsSameType<Value, BaseType> extends true // There is trick to prevent typescript crush on cyclic dependencies
  ? `${Key}` | `${Key}.${keyof Value & string}`
  : `${Key}` | `${Key}.${Path<Value>}`;

type Path<Model> = Model extends ReadonlyArray<infer Value>
  ? IsTuple<Model> extends true
    ? {
        [K in TupleKey<Model>]-?: PathImpl<K & string, Model[K], Model>;
      }[TupleKey<Model>]
    : { [Key in keyof Model[0]]-?: Key & string }[keyof Model[0]]
  : {
      [Key in keyof Model]-?: PathImpl<Key & string, Model[Key], Model>;
    }[keyof Model];

type FieldPath<TFieldValues extends object> = Path<TFieldValues>;

type ArrayPathImpl<
  Key extends string | number,
  Value,
  BaseType
> = Value extends Primitive
  ? never
  : Value extends ReadonlyArray<infer U>
  ? U extends Primitive
    ? never
    : IsSameType<Value, BaseType> extends true // There is trick to prevent typescript crush on cyclic dependencies
    ? `${Key}CyclicDepsFounded`
    : `${Key}` | `${Key}.${ArrayPath<Value>}`
  : `${Key}.${ArrayPath<Value>}`;

type ArrayPath<Model> = Model extends ReadonlyArray<infer V>
  ? IsTuple<Model> extends true
    ? {
        [Key in TupleKey<Model>]-?: ArrayPathImpl<
          Key & string,
          Model[Key],
          Model
        >;
      }[TupleKey<Model>]
    : { [Key in keyof Model[0]]-?: Key & string }[keyof Model[0]]
  : {
      [Key in keyof Model]-?: ArrayPathImpl<Key & string, Model[Key], Model>;
    }[keyof Model];

type ModelPrimitive = string | number | boolean | symbol | bigint;

type IsAttribute<
  Key extends string | number,
  Value
> = Value extends ModelPrimitive ? `${Key}` : never;

type IsNotAttribute<
  Key extends string | number,
  Value
> = Value extends ModelPrimitive ? never : `${Key}`;

type GetStrictOrWeak<Model extends object, Strict, Weak> = Model extends {
  id: infer U;
}
  ? Strict
  : Weak;

type GetAttributes<Model extends object> = {
  [Key in keyof Model]-?: IsAttribute<Key & string, Model[Key]>;
}[keyof Model];

type GetRelations<Model extends object> = {
  [Key in keyof Model]-?: IsNotAttribute<Key & string, Model[Key]>;
}[keyof Model];
// </editor-fold>

// <editor-fold desc="Output type utils">
type Deduplicate<T extends readonly any[]> = T extends [infer F, ...infer Rest]
  ? F extends Rest[number]
    ? Deduplicate<Rest>
    : [F, ...Deduplicate<Rest>]
  : T;

type TransformNestedKeys<Keys extends readonly string[], V> = {
  [K in keyof Keys]: Keys[K] extends string
    ? TransformNestedKey<Keys[K], V>
    : never;
};

type TransformNestedKey<
  K extends string,
  V
> = K extends `${infer Key}.${infer Rest}`
  ? { [P in Key]: TransformNestedKey<Rest, V> }
  : { [P in K]: V };
// </editor-fold>
