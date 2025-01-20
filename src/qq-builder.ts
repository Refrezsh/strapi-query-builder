import { _isDefined, _set } from "./query-utils";
import {
  EntityFilterAttributes,
  FilterOperatorKey,
  GetAttributeType,
  InitialBuildConfig,
  InternalBuilderConfig,
  MultipleAttributeType,
  OnType,
  ParseFilters,
  ParseList,
  PopulateKey,
  PublicationStates,
  QueryRawInfo,
  SingleAttributeType,
  SortKey,
  StrapiAttributesFilter,
  StrapiFields,
  StrapiInputPopulateKey,
  StrapiPagination,
  StrapiPopulate,
  StrapiPopulations,
  StrapiRawFilters,
  StrapiSingleFieldInput,
  StrapiSortOptions,
  StrapiSorts,
  TransformNestedKey,
  TransformNestedKeys,
} from "./query-types-util";

export class QQBuilder<
  Model extends object,
  Data extends object = {},
  Config extends InternalBuilderConfig = InitialBuildConfig
> {
  private _query: QueryRawInfo<Model, Data> = {
    sort: new Map(),
    fields: new Set(),
    filters: {
      rootLogical: "$and",
      negate: false,
      attributeFilters: [],
    },
    population: new Map(),
  };

  //<editor-fold desc="Fields">
  /**
   * @description Select specific fields
   * @description Same keys will be merged
   * @example
   * new EQBuilder<Model>().fields(["name", "type"]);
   * // { fields: ["name", "type"] }
   * @param {StrapiSingleFieldInput[]} fields List of fields
   */
  public fields<
    F extends readonly [
      StrapiSingleFieldInput<Model>,
      ...StrapiSingleFieldInput<Model>[]
    ]
  >(fields: F) {
    fields.forEach((f) => this._query.fields.add(f));
    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: [...Config["fields"], ...F];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Select specific field
   * @description Same keys will be merged
   * @example
   * new EQBuilder<Model>().field("key");
   * // { fields: ["key"] }
   * @param {StrapiSingleFieldInput} field Single field
   */
  public field<F extends StrapiSingleFieldInput<Model>>(field: F) {
    this._query.fields.add(field);
    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: [...Config["fields"], F];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }
  //</editor-fold>

  //<editor-fold desc="Sorts">
  /**
   * @description Sort results by attribute in ascending order
   * @description Same keys will be merged
   * @description Allowed "attribute.dot" notation
   * @param {SortKey} attribute Attribute
   * @example
   * new EQBuilder<Model>().sortAsc("attribute");
   * // { sort: [{"attribute": "asc"}] }
   * @example
   * new EQBuilder<Model>().sortAsc("parentKey.childKey");
   * // { sort: [{"parentKey": { "childKey": "asc" }}]}
   */
  public sortAsc<K extends SortKey<Model>>(attribute: K) {
    return this.sort(attribute, "asc");
  }

  /**
   * @description Sort results by attribute in descending order
   * @description Same keys will be merged
   * @description Allowed "attribute.dot" notation
   * @param {SortKey} attribute Attribute
   * @example
   * new EQBuilder<Model>().sortAsc("attribute");
   * // { sort: [{"attribute": "desc"}] }
   * @example
   * new EQBuilder<Model>().sortAsc("parentKey.childKey");
   * // { sort: [{"parentKey": { "childKey": "desc" }}]}
   */
  public sortDesc<K extends SortKey<Model>>(attribute: K) {
    return this.sort(attribute, "desc");
  }

  /**
   * @description Sort results by attributes list in ascending order
   * @description Same keys will be merged
   * @description Allowed "attribute.dot" notation
   * @param {SortKey[]} attributes Attributes list
   * @example
   * new EQBuilder<Model>().sortsAsc(["attribute1", "attribute2"]);
   * // { sort: [{"attribute1": "asc"}, {"attribute2": "asc"}] }
   */
  public sortsAsc<K extends readonly [SortKey<Model>, ...SortKey<Model>[]]>(
    attributes: K
  ) {
    return this.sorts(attributes, "asc");
  }

  /**
   * @description Sort results by attributes list in descending order
   * @description Same keys will be merged
   * @description Allowed "attribute.dot" notation
   * @param {SortKey[]} attributes Attributes list
   * @example
   * new EQBuilder<Model>().sortsAsc(["attribute1", "attribute2"]);
   * // { sort: [{"attribute1": "desc"}, {"attribute2": "desc"}] }
   */
  public sortsDesc<K extends readonly [SortKey<Model>, ...SortKey<Model>[]]>(
    attributes: K
  ) {
    return this.sorts(attributes, "desc");
  }

  /**
   * @description Sort results by attribute and direction
   * @description Same keys will be merged
   * @description Allowed "attribute.dot" notation
   * @param {SortKey} attribute Attribute
   * @param {StrapiSortOptions} direction Direction "asc" ord "desc"
   * @example
   * new EQBuilder<Model>().sort("attribute", "asc");
   * // { sort: [{"attribute": "asc"}] }
   */
  public sort<K extends SortKey<Model>, D extends StrapiSortOptions>(
    attribute: K,
    direction: D
  ) {
    this._query.sort.set(attribute, direction);
    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: [...Config["sort"], TransformNestedKey<K, D>];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Sort results by attributes list and direction
   * @description Same keys will be merged
   * @description Allowed "attribute.dot" notation
   * @param {SortKey} attributes Attribute list
   * @param {StrapiSortOptions} direction Direction "asc" or "desc"
   * @example
   * new EQBuilder<Model>().sorts(["attribute1", "attribute2"], "desc");
   * // { sort: [{"attribute1": "desc"}, {"attribute2": "desc"}] }
   */
  public sorts<
    K extends readonly [SortKey<Model>, ...SortKey<Model>[]],
    D extends StrapiSortOptions
  >(attributes: K, direction: D) {
    attributes.forEach((key) => this._query.sort.set(key, direction));
    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: [...Config["sort"], ...TransformNestedKeys<K, D>];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }
  //</editor-fold>

  //<editor-fold desc="Filters">
  /**
   * @description Change root logical to "$or"
   * @description Default - "$and"
   * @example
   * new EQBuilder<Model>().or();
   * // { filters: { $or: [...] }}
   */
  public or() {
    this._query.filters.rootLogical = "$or";
    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: "$or";
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Change root logical to "$and"
   * @description Default - "$and"
   * @example
   * new EQBuilder<Model>().and();
   * // { filters: { $and: [...] }}
   */
  public and() {
    this._query.filters.rootLogical = "$and";
    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: "$and";
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Add "$not" before root logical
   * @description Default - false
   * @example
   * new EQBuilder<Model>().not();
   * // { filters: { $not: { $and: [...] }}}
   */
  public not() {
    this._query.filters.negate = true;
    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: true;
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Add deep filters for current model
   * @example
   * new EQBuilder<TestModel>()
   *     .eq("options", "value")
   *     .filterDeep(() =>
   *       new EQBuilder<TestModel>().or().eq("name", "value1").eq("name", "value2")
   *     )
   * // {
   * //    filters: {
   * //      $and: [
   * //        { options: { $eq: "value" } },
   * //        { $or: [{ name: { $eq: "value1" } }, { name: { $eq: "value2" } }] }
   * //      ];
   * //    };
   * // }
   *
   * // Reads like model.options === "value" && (model.name === "value1" || model.name === "value2")
   * @param {QQBuilderCallback} builderFactory Fabric function that returns builder with filters for current model
   */
  public filterDeep<DeepConfig extends InternalBuilderConfig>(
    builderFactory: QQBuilderCallback<Model, {}, DeepConfig>
  ) {
    const deepBuilder = builderFactory();
    this._query.filters.attributeFilters.push({
      nested: deepBuilder.getRawFilters() as unknown as StrapiRawFilters<{}>,
    });

    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: [
          ...Config["filters"],
          ParseFilters<
            DeepConfig["filters"],
            DeepConfig["rootLogical"],
            DeepConfig["negate"]
          >
        ];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Add related model filters
   * @example
   * new EQBuilder<TestModel>()
   *       .filterRelation("nested", () =>
   *         new EQBuilder<NestedModel>().eq("id", "value")
   *       )
   * // {
   * //      filters: {
   * //        $and: [{ nested: { $and: [{ id: { $eq: "value" } }] } }];
   * //      }
   * // }
   * @param {FilterOperatorKey} attribute Attribute
   * @param {QQBuilderCallback} builderFactory Fabric function that returns builder with filters for relation model
   */
  public filterRelation<
    RelationModel extends object,
    K extends FilterOperatorKey<Model>,
    RelationConfig extends InternalBuilderConfig
  >(
    attribute: K,
    builderFactory: QQBuilderCallback<RelationModel, {}, RelationConfig>
  ) {
    const relationBuilder = builderFactory();
    this._query.filters.attributeFilters.push({
      key: attribute,
      nested:
        relationBuilder.getRawFilters() as unknown as StrapiRawFilters<{}>,
    });

    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: [
          ...Config["filters"],
          TransformNestedKey<
            K,
            ParseFilters<
              RelationConfig["filters"],
              RelationConfig["rootLogical"],
              RelationConfig["negate"]
            >
          >
        ];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Attribute equals input value
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().eq("attribute", "value");
   * // { filters: { $and: [{ attribute: { $eq: "value" }} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {SingleAttributeType} value Filter by value
   */
  public eq<K extends FilterOperatorKey<Model>, V extends SingleAttributeType>(
    attribute: K,
    value: V
  ) {
    return this.filter(attribute, "$eq", value);
  }

  /**
   * @description Attribute not equals input value
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().notEq("key", "value");
   * // { filters: { $and: [{ attribute: { $not: { $eq: "value" } }} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {SingleAttributeType} value Filter by value
   */
  public notEq<
    K extends FilterOperatorKey<Model>,
    V extends SingleAttributeType
  >(attribute: K, value: V) {
    return this.filterNot(attribute, "$eq", value);
  }

  /**
   * @description Attribute equals input value (case-insensitive)
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().eqi("attribute", "value");
   * // { filters: { $and: [{ attribute: { $eqi: "value" }} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {SingleAttributeType} value Filter by value
   */
  public eqi<K extends FilterOperatorKey<Model>, V extends SingleAttributeType>(
    attribute: K,
    value: V
  ) {
    return this.filter(attribute, "$eqi", value);
  }

  /**
   * @description Attribute not equals input value (case-insensitive)
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().notEqi("attribute", "value");
   * // { filters: { $and: [{ attribute: { $not: { $eqi: "value" }}} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {SingleAttributeType} value Filter by value
   */
  public notEqi<
    K extends FilterOperatorKey<Model>,
    V extends SingleAttributeType
  >(attribute: K, value: V) {
    return this.filterNot(attribute, "$eqi", value);
  }

  /**
   * @description Attribute does not equal input value
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().ne("attribute", "value");
   * // { filters: { $and: [{ attribute: { $ne: "value" }} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {SingleAttributeType} value Filter by value
   */
  public ne<K extends FilterOperatorKey<Model>, V extends SingleAttributeType>(
    attribute: K,
    value: V
  ) {
    return this.filter(attribute, "$ne", value);
  }

  /**
   * @description Attribute does not equal input value (case-insensitive)
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().nei("attribute", "value");
   * // { filters: { $and: [{ attribute: { $nei: "value" }} ] }}
   * @param {FilterOperatorKey} attribute Filter key
   * @param {SingleAttributeType} value Filter by value
   */
  public nei<K extends FilterOperatorKey<Model>, V extends SingleAttributeType>(
    attribute: K,
    value: V
  ) {
    return this.filter(attribute, "$nei", value);
  }

  /**
   * @description Attribute contains the input value (case-sensitive)
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().contains("attribute", "value");
   * // { filters: { $and: [{ attribute: { $contains: "value" }} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {SingleAttributeType} value Filter by value
   */
  public contains<
    K extends FilterOperatorKey<Model>,
    V extends SingleAttributeType
  >(attribute: K, value: V) {
    return this.filter(attribute, "$contains", value);
  }

  /**
   * @description Attribute does not contain the input value (case-sensitive)
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().notContains("attribute", "value");
   * // { filters: { $and: [{ attribute: { $notContains: "value" }} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {SingleAttributeType} value Filter by value
   */
  public notContains<
    K extends FilterOperatorKey<Model>,
    V extends SingleAttributeType
  >(attribute: K, value: V) {
    return this.filter(attribute, "$notContains", value);
  }

  /**
   * @description Attribute contains the input value. $containsi is not case-sensitive
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().containsi("attribute", "value");
   * // { filters: { $and: [{ attribute: { $containsi: "value" }} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {SingleAttributeType} value Filter by value
   */
  public containsi<
    K extends FilterOperatorKey<Model>,
    V extends SingleAttributeType
  >(attribute: K, value: V) {
    return this.filter(attribute, "$containsi", value);
  }

  /**
   * @description Attribute does not contain the input value. $notContainsi is not case-sensitive
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().notContainsi("attribute", "value");
   * // { filters: { $and: [{ attribute: { $notContainsi: "value" }} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {SingleAttributeType} value Filter by value
   */
  public notContainsi<
    K extends FilterOperatorKey<Model>,
    V extends SingleAttributeType
  >(attribute: K, value: V) {
    return this.filter(attribute, "$notContainsi", value);
  }

  /**
   * @description Attribute is contained in the input list
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().in("attribute", ["value1", "value2"]);
   * // { filters: { $and: [{ attribute: { $in: ["value1", "value2"] }} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {MultipleAttributeType} value Filter in by values
   */
  public in<
    K extends FilterOperatorKey<Model>,
    V extends MultipleAttributeType
  >(attribute: K, value: V) {
    return this.filter(attribute, "$in", value);
  }

  /**
   * @description Attribute is not contained in the input list
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().notIn("attribute", ["value1", "value2"]);
   * // { filters: { $and: [{ attribute: { $notIn: ["value1", "value2"] }} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {MultipleAttributeType} value Filter not in by values
   */
  public notIn<
    K extends FilterOperatorKey<Model>,
    V extends MultipleAttributeType
  >(attribute: K, value: V) {
    return this.filter(attribute, "$notIn", value);
  }

  /**
   * @description Attribute is between the 2 input values
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().between("attribute", ["value1", "value2"]);
   * // { filters: { $and: [{ attribute: { $between: ["value1", "value2"] }} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {MultipleAttributeType} value Filter by tuple
   */
  public between<
    K extends FilterOperatorKey<Model>,
    V extends MultipleAttributeType
  >(attribute: K, value: V) {
    return this.filter(attribute, "$between", value);
  }

  /**
   * @description Attribute is not between the 2 input values
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().notBetween("attribute", ["value1", "value2"]);
   * // { filters: { $and: [{ attribute: { $not: { $between: ["value1", "value2"] }}} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {MultipleAttributeType} value Filter by tuple
   */
  public notBetween<
    K extends FilterOperatorKey<Model>,
    V extends MultipleAttributeType
  >(attribute: K, value: V) {
    return this.filterNot(attribute, "$between", value);
  }

  /**
   * @description Attribute is less than the input value
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().lt("attribute", "value");
   * // { filters: { $and: [{ attribute: { $lt: "value" }} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {SingleAttributeType} value Filter by value
   */
  public lt<K extends FilterOperatorKey<Model>, V extends SingleAttributeType>(
    attribute: K,
    value: V
  ) {
    return this.filter(attribute, "$lt", value);
  }

  /**
   * @description Attribute is not less than the input value
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().notLt("attribute", "value");
   * // { filters: { $and: [{ attribute: { $not: { $lt: "value" }}} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {SingleAttributeType} value Filter by value
   */
  public notLt<
    K extends FilterOperatorKey<Model>,
    V extends SingleAttributeType
  >(attribute: K, value: V) {
    return this.filterNot(attribute, "$lt", value);
  }

  /**
   * @description Attribute is less than or equal to the input value
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().lte("attribute", "value");
   * // { filters: { $and: [{ attribute: { $lte: "value" }} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {SingleAttributeType} value Filter by value
   */
  public lte<K extends FilterOperatorKey<Model>, V extends SingleAttributeType>(
    attribute: K,
    value: V
  ) {
    return this.filter(attribute, "$lte", value);
  }

  /**
   * @description Attribute is not less than or equal to the input value
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().notLte("attribute", "value");
   * // { filters: { $and: [{ attribute: { $not: { $lte: "value" }}} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {SingleAttributeType} value Filter by value
   */
  public notLte<
    K extends FilterOperatorKey<Model>,
    V extends SingleAttributeType
  >(attribute: K, value: V) {
    return this.filterNot(attribute, "$lte", value);
  }

  /**
   * @description Attribute is greater than the input value
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().gt("attribute", "value");
   * // { filters: { $and: [{ attribute: { $gt: "value" }} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {SingleAttributeType} value Filter by value
   */
  public gt<K extends FilterOperatorKey<Model>, V extends SingleAttributeType>(
    attribute: K,
    value: V
  ) {
    return this.filter(attribute, "$gt", value);
  }

  /**
   * @description Attribute is not greater than the input value
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().notGt("attribute", "value");
   * // { filters: { $and: [{ attribute: { $not: { $gt: "value" }}} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {SingleAttributeType} value Filter by value
   */
  public notGt<
    K extends FilterOperatorKey<Model>,
    V extends SingleAttributeType
  >(attribute: K, value: V) {
    return this.filterNot(attribute, "$gt", value);
  }

  /**
   * @description Attribute is greater than or equal to the input value
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().gte("attribute", "value");
   * // { filters: { $and: [{ attribute: { $gte: "value" }} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {SingleAttributeType} value Filter by value
   */
  public gte<K extends FilterOperatorKey<Model>, V extends SingleAttributeType>(
    attribute: K,
    value: V
  ) {
    return this.filter(attribute, "$gte", value);
  }

  /**
   * @description Attribute is not greater than or equal to the input value
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().notGte("attribute", "value");
   * // { filters: { $and: [{ attribute: { $not: { $gte: "value" }}} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {SingleAttributeType} value Filter by value
   */
  public notGte<
    K extends FilterOperatorKey<Model>,
    V extends SingleAttributeType
  >(attribute: K, value: V) {
    return this.filterNot(attribute, "$gte", value);
  }

  /**
   * @description Attribute starts with input value
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().startsWith("attribute", "value");
   * // { filters: { $and: [{ attribute: { $startsWith: "value" }} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {SingleAttributeType} value Filter by value
   */
  public startsWith<
    K extends FilterOperatorKey<Model>,
    V extends SingleAttributeType
  >(attribute: K, value: V) {
    return this.filter(attribute, "$startsWith", value);
  }

  /**
   * @description Attribute not starts with input value
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().notStartsWith("attribute", "value");
   * // { filters: { $and: [{ attribute: { $not: { $startsWith: "value" }}} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {SingleAttributeType} value Filter by value
   */
  public notStartsWith<
    K extends FilterOperatorKey<Model>,
    V extends SingleAttributeType
  >(attribute: K, value: V) {
    return this.filterNot(attribute, "$startsWith", value);
  }

  /**
   * @description Attribute ends with input value
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().endsWith("attribute", "value");
   * // { filters: { $and: [{ attribute: { $endsWith: "value" }} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {SingleAttributeType} value Filter by value
   */
  public endsWith<
    K extends FilterOperatorKey<Model>,
    V extends SingleAttributeType
  >(attribute: K, value: V) {
    return this.filter(attribute, "$endsWith", value);
  }

  /**
   * @description Attribute not ends with input value
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().notEndsWith("attribute", "value");
   * // { filters: { $and: [{ attribute: { $not: { $endsWith: "value" }}} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {SingleAttributeType} value Filter by value
   */
  public notEndsWith<
    K extends FilterOperatorKey<Model>,
    V extends SingleAttributeType
  >(attribute: K, value: V) {
    return this.filterNot(attribute, "$endsWith", value);
  }

  /**
   * @description Attribute is null
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().null("attribute", "value");
   * // { filters: { $and: [{ attribute: { $null: "value" }} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {boolean} value True/false
   */
  public null<K extends FilterOperatorKey<Model>, V extends boolean>(
    attribute: K,
    value: V
  ) {
    return this.filter(attribute, "$null", value);
  }

  /**
   * @description Attribute is not null
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new EQBuilder<Model>().notNull("attribute", "value");
   * // { filters: { $and: [{ attribute: { $notNull: "value" }} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {boolean} value True/false
   */
  public notNull<K extends FilterOperatorKey<Model>, V extends boolean>(
    attribute: K,
    value: V
  ) {
    return this.filter(attribute, "$notNull", value);
  }

  /**
   * @description Generalized filter operator
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @param {FilterOperatorKey} attribute Attribute
   * @param {EntityFilterAttributes} filter Filter operator, "$eq", "$contains", etc.
   * @param {MultipleAttributeType | SingleAttributeType} value Attribute value, depends on filter operator
   * @example
   * new EQBuilder<Model>().filter("attribute", "$eq", "value");
   * // { filters: { $and: [{ attribute: { $eq: "value" }} ] }}
   */
  public filter<
    K extends FilterOperatorKey<Model>,
    F extends EntityFilterAttributes,
    V extends GetAttributeType<F>
  >(attribute: K, filter: F, value: V) {
    this._query.filters.attributeFilters.push({
      key: attribute,
      type: filter,
      value: value,
      negate: false,
    });

    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: [...Config["filters"], TransformNestedKey<K, { [D in F]: V }>];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Generalized filter operator with "$not"
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @param {FilterOperatorKey} attribute Attribute
   * @param {EntityFilterAttributes} filter Filter operator, "$eq", "$contains", etc.
   * @param {MultipleAttributeType | SingleAttributeType} value Attribute value, depends on filter operator
   * @example
   * new EQBuilder<Model>().filterNot("attribute", "$eq", "value");
   * // { filters: { $and: [{ attribute: { $not: { $eq: "value" }}} ] }}
   */
  public filterNot<
    K extends FilterOperatorKey<Model>,
    F extends EntityFilterAttributes,
    V extends GetAttributeType<F>
  >(attribute: K, filter: F, value: V) {
    this._query.filters.attributeFilters.push({
      key: attribute,
      type: filter,
      value: value,
      negate: true,
    });

    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: [
          ...Config["filters"],
          TransformNestedKey<K, { $not: { [D in F]: V } }>
        ];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }
  //</editor-fold>

  //<editor-fold desc="Populate">
  /**
   * @description Populate all relations of model
   * @description If any other populate presented, it will be ignored
   * @example
   * new EQBuilder<Model>().populateAll();
   * // { populate: "*" }
   */
  public populateAll() {
    this._addToPopulate({ key: "*" });
    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: true;
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Populate all model by attribute
   * @description Same keys will be overriding by last operator
   * @param {StrapiInputPopulateKey} attribute Attribute
   * @example
   * new EQBuilder<Model>().populate("relation");
   * // { populate: { relation: true } }
   */
  public populate<K extends StrapiInputPopulateKey<Model>>(attribute: K) {
    this._addToPopulate({ key: attribute });
    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: {
          [P in keyof Config["populates"] | K]: P extends K
            ? true
            : P extends keyof Config["populates"]
            ? Config["populates"][P]
            : never;
        };
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Populate all models by attributes list
   * @description Same keys will be overriding by last operator
   * @param {StrapiInputPopulateKey[]} attribute Attributes list
   * @example
   * new EQBuilder<Model>().populates(["relation1", "relation2"]);
   * // { populate: { relation1: true, relation2: true } }
   */
  public populates<
    K extends readonly [
      StrapiInputPopulateKey<Model>,
      ...StrapiInputPopulateKey<Model>[]
    ]
  >(attribute: K) {
    attribute.forEach((k) => this._addToPopulate({ key: k }));
    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: {
          [P in keyof Config["populates"] | K[number]]: P extends K[number]
            ? true
            : P extends keyof Config["populates"]
            ? Config["populates"][P]
            : never;
        };
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Populate relation model, with specific deep config
   * @description Same keys will be overwritten by last operator
   * @param {StrapiInputPopulateKey} attribute Attribute
   * @param {QQBuilderCallback} builderFactory Fabric function that returns builder with filters, sort, fields and other deep populate builders for Relation Model
   * @example
   * new EQBuilder<TestModel>()
   *       .populateRelation("nested", () =>
   *         new EQBuilder<NestedModel>().eq("id", "value").field("id")
   *       )
   * //     populate: {
   * //       nested: {
   * //         fields: ["id"];
   * //         filters: { $and: [{ id: { $eq: "value" } }] };
   * //       }
   * //     }
   */
  public populateRelation<
    PopulateModel extends object,
    K extends StrapiInputPopulateKey<Model>,
    RelationConfig extends InternalBuilderConfig
  >(
    attribute: K,
    builderFactory: QQBuilderCallback<PopulateModel, {}, RelationConfig>
  ) {
    const populateBuilder = builderFactory();

    const populate: StrapiPopulate<Model, PopulateModel> = {
      key: attribute,
      nestedQuery: {
        fields: populateBuilder.getRawFields(),
        sort: populateBuilder.getRawSort(),
        population: populateBuilder.getRawPopulation(),
        filters: populateBuilder.getRawFilters(),
      },
    };

    this._addToPopulate(populate);
    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: {
          [P in keyof Config["populates"] | K]: P extends K
            ? BuildQQCallback<RelationConfig>
            : P extends keyof Config["populates"]
            ? Config["populates"][P]
            : never;
        };
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Populate relation with dynamic zone.
   * @description Same relation model keys will be overwritten
   * @description Same dynamic zone component keys will be overwritten
   * @param {StrapiInputPopulateKey} attribute Attribute
   * @param {string} componentKey Dynamic zone component key
   * @param {builderFactory} builderFactory Fabric function that returns builder with filters, sort, fields and other deep populate builders for Dynamic zone component
   * @example
   * new EQBuilder<TestModel>()
   *       .populateDynamic("nested", "component.1", () =>
   *         new EQBuilder<NestedModel>().eq("id", "value")
   *       )
   *       .populateDynamic("nested", "component.2", () =>
   *         new EQBuilder<NestedModel>().notEq("id", "value3")
   *       )
   * //      populate: {
   * //       nested: {
   * //         on: {
   * //           "component.1": { filters: { $and: [{ id: { $eq: "value" } }] } };
   * //           "component.2": {
   * //             filters: { $and: [{ id: { $not: { $eq: "value3" } } }] };
   * //           };
   * //         };
   * //       };
   * //     };
   */
  public populateDynamic<
    PopulateModel extends object,
    K extends StrapiInputPopulateKey<Model>,
    C extends string,
    RelationConfig extends InternalBuilderConfig
  >(
    attribute: K,
    componentKey: C,
    builderFactory: QQBuilderCallback<PopulateModel, {}, RelationConfig>
  ) {
    const populateBuilder = builderFactory();
    const newQuery = {
      fields: populateBuilder.getRawFields(),
      sort: populateBuilder.getRawSort(),
      population: populateBuilder.getRawPopulation(),
      filters: populateBuilder.getRawFilters(),
    };

    const currentQuery = this._query.population.get(attribute);
    if (!_isDefined(currentQuery)) {
      this._addToPopulate({
        key: attribute,
        dynamicQuery: { [componentKey]: newQuery },
      });
    } else {
      const currentDynamic = currentQuery.dynamicQuery || {};
      currentDynamic[componentKey] = newQuery;
      this._addToPopulate({
        key: attribute,
        dynamicQuery: currentDynamic,
      });
    }

    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: {
          [P in keyof Config["populates"] | K]: P extends K
            ? {
                on: {
                  [D in keyof OnType<Config["populates"][P]> | C]: D extends C
                    ? BuildQQCallback<RelationConfig>
                    : D extends keyof OnType<Config["populates"][P]>
                    ? OnType<Config["populates"][P]>[D]
                    : never;
                };
              }
            : P extends keyof Config["populates"]
            ? Config["populates"][P]
            : never;
        };
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }

  private _addToPopulate<PopulateModel extends object>(
    populate: StrapiPopulate<Model, PopulateModel>
  ) {
    this._query.population.set(populate.key, populate);
  }
  //</editor-fold>

  //<editor-fold desc="Pagination">
  /**
   * @description Pagination by page, when defining the page and pageSize parameters
   * @param {number} page Current page
   * @param {number} pageSize Page size
   * @example
   * new EQBuilder<TestModel>().page(1, 26)
   * // { page: 1; pageSize: 26 }
   */
  public page<Page extends number, PageSize extends number>(
    page: Page,
    pageSize: PageSize
  ) {
    this._query.pagination = {
      page: page,
      pageSize: pageSize,
      paginationType: "page",
    };
    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: { page: Page; pageSize: PageSize };
        paginationType: "page";
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Pagination by offset, when defining the start and limit parameters
   * @param {number} start
   * @param {number} limit
   * @example
   * new EQBuilder<TestModel>().pageLimit(0, 26)
   * // { start: 0; limit: 26 }
   */
  public pageLimit<Start extends number, limit extends number>(
    start: Start,
    limit: limit
  ) {
    this._query.pagination = {
      page: start,
      pageSize: limit,
      paginationType: "limit",
    };
    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: { page: Start; pageSize: limit };
        paginationType: "limit";
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }
  //</editor-fold>

  //<editor-fold desc="Data">
  /**
   * @description Set query data
   * @param data Data object
   * @example
   * new EQBuilder<TestModel, TestModel>().data({ id: 1 })
   * // { data: { id: 1 } }
   */
  public data<D extends Data>(data: D) {
    this._query.data = data;
    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: D;
      }
    >;
  }
  //</editor-fold>

  //<editor-fold desc="Join utils">
  /**
   * @description Attach fields from other query builder
   * @description Same keys will be merged
   * @param {QQBuilder} builder Embedded builder
   */
  public joinFields<DeepConfig extends InternalBuilderConfig>(
    builder: QQBuilder<Model, {}, DeepConfig>
  ) {
    builder.getRawFields().forEach((f) => this._query.fields.add(f));
    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: [...Config["fields"], ...DeepConfig["fields"]];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Attach sorts from other query builder
   * @description Same keys will be merged
   * @param {QQBuilder} builder Embedded builder
   */
  public joinSort<DeepConfig extends InternalBuilderConfig>(
    builder: QQBuilder<Model, {}, DeepConfig>
  ) {
    builder
      .getRawSort()
      .forEach((value, key) => this._query.sort.set(key, value));

    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: [...Config["sort"], ...DeepConfig["sort"]];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Attach filters from other query builder
   * @param {QQBuilder} builder Embedded builder
   * @param {boolean} joinRootLogical Override root logical ?
   * @param {boolean} joinRootNegate Override root negate ?
   */
  public joinFilters<
    DeepConfig extends InternalBuilderConfig,
    JoinRootLogical extends boolean = false,
    JoinRootNegate extends boolean = false
  >(
    builder: QQBuilder<Model, {}, DeepConfig>,
    joinRootLogical?: JoinRootLogical,
    joinRootNegate?: JoinRootNegate
  ) {
    const externalFilters = builder.getRawFilters();

    this._query.filters.attributeFilters =
      this._query.filters.attributeFilters.concat(
        externalFilters.attributeFilters as unknown as StrapiAttributesFilter<Model>[]
      );

    if (joinRootLogical) {
      this._query.filters.rootLogical = externalFilters.rootLogical;
    }

    if (joinRootNegate) {
      this._query.filters.negate = externalFilters.negate;
    }

    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: [...Config["filters"], ...DeepConfig["filters"]];
        rootLogical: JoinRootLogical extends true
          ? DeepConfig["rootLogical"]
          : Config["rootLogical"];
        negate: JoinRootNegate extends true
          ? DeepConfig["negate"]
          : Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Attach populates from other query builder
   * @description Same keys will be overwritten
   * @param {QQBuilder} builder Embedded builder
   */
  public joinPopulate<DeepConfig extends InternalBuilderConfig>(
    builder: QQBuilder<Model, {}, DeepConfig>
  ) {
    builder
      .getRawPopulation()
      .forEach((populate) =>
        this._query.population.set(
          populate.key as PopulateKey<Model>,
          populate as unknown as StrapiPopulate<Model, any>
        )
      );

    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: {
          [P in
            | keyof Config["populates"]
            | keyof DeepConfig["populates"]]: P extends keyof DeepConfig["populates"]
            ? DeepConfig["populates"][P]
            : P extends keyof Config["populates"]
            ? Config["populates"][P]
            : never;
        };
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Attach pagination from other query builder
   * @param {QQBuilder} builder Embedded builder
   */
  public joinPagination<DeepConfig extends InternalBuilderConfig>(
    builder: QQBuilder<Model, {}, DeepConfig>
  ) {
    const externalPagination = builder.getRawPagination();

    if (_isDefined(externalPagination)) {
      this._query.pagination = externalPagination;
    }

    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: DeepConfig["pagination"];
        paginationType: DeepConfig["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Join query from other query builder to current query builder
   * @param {QQBuilder} builder Embedded builder
   */
  public joinQuery<DeepConfig extends InternalBuilderConfig>(
    builder: QQBuilder<Model, {}, DeepConfig>
  ) {
    this.joinPopulate(builder);
    this.joinFilters(builder);
    this.joinSort(builder);
    this.joinFields(builder);

    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: [...Config["fields"], ...DeepConfig["fields"]];
        sort: [...Config["sort"], ...DeepConfig["sort"]];
        filters: [...Config["filters"], ...DeepConfig["filters"]];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: {
          [P in
            | keyof Config["populates"]
            | keyof DeepConfig["populates"]]: P extends keyof DeepConfig["populates"]
            ? DeepConfig["populates"][P]
            : P extends keyof Config["populates"]
            ? Config["populates"][P]
            : never;
        };
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }
  //</editor-fold>

  //<editor-fold desc="Service specific">
  /**
   * @description Set locale code
   * @description Entity Service Specific
   * @param {string} code Locale code
   * @example
   * new EQBuilder<TestModel>().locale("ua")
   * // { locale: "ua" }
   */
  public locale<L extends string>(code: L) {
    this._query.locale = code;
    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: Config["publicationState"];
        locale: L;
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Set publication state for draft & publish
   * @description Entity Service Specific
   * @param {PublicationStates} state Publication state
   * @example
   * new EQBuilder<TestModel>().publicationState("live")
   * // { publicationState: "live" }
   */
  public publicationState<P extends PublicationStates>(state: P) {
    this._query.publicationState = state;
    return this as unknown as QQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: Config["populateAll"];
        populates: Config["populates"];
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
        publicationState: P;
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }
  //</editor-fold>

  //<editor-fold desc="Build process">
  /**
   * @description Build the current query into the final Strapi Entity Service format
   * @return Query with dynamically generated query type
   */
  public build() {
    const builtQuery = QQBuilder._buildQuery(this._query);
    return builtQuery as BuildQQOutput<Config>;
  }

  private static _buildQuery<Md extends object, Dt extends object>(
    rawQuery: QueryRawInfo<Md, Dt>
  ) {
    const builtQuery: any = {};

    const parsedFields =
      rawQuery.fields.size > 0 ? [...rawQuery.fields] : undefined;
    if (_isDefined(parsedFields)) {
      builtQuery.fields = parsedFields;
    }

    const parsedSort = QQBuilder._parseSort(rawQuery.sort);
    if (parsedSort.length > 0) {
      builtQuery.sort = parsedSort;
    }

    const parsedFilters = QQBuilder._parseFilters(rawQuery.filters);
    if (_isDefined(parsedFilters)) {
      builtQuery.filters = parsedFilters;
    }

    const parsedPopulation = QQBuilder._parsePopulate(rawQuery.population);
    if (_isDefined(parsedPopulation)) {
      builtQuery.populate = parsedPopulation;
    }

    const pagination = rawQuery.pagination;
    if (_isDefined(pagination)) {
      if (pagination.paginationType === "page") {
        builtQuery.page = pagination.page;
        builtQuery.pageSize = pagination.pageSize;
      } else {
        builtQuery.start = pagination.page;
        builtQuery.limit = pagination.pageSize;
      }
    }

    const data = rawQuery.data;
    if (_isDefined(data)) {
      builtQuery.data = data;
    }

    const publicationState = rawQuery.publicationState;
    if (_isDefined(publicationState)) {
      builtQuery.publicationState = publicationState;
    }

    const locale = rawQuery.locale;
    if (_isDefined(locale)) {
      builtQuery.locale = locale;
    }

    return builtQuery;
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

  private static _parseAttributeFilter<Md extends object>(
    filter: StrapiAttributesFilter<Md>
  ): any | undefined {
    if (filter.nested !== undefined) {
      const nestedFilters = this._parseFilters(filter.nested);
      if (!_isDefined(nestedFilters)) return undefined;

      return !_isDefined(filter.key)
        ? nestedFilters
        : _set({}, filter.key, nestedFilters);
    }

    if (
      !_isDefined(filter.value) ||
      !_isDefined(filter.type) ||
      !_isDefined(filter.key)
    ) {
      return undefined;
    }

    const filterValue = {
      [filter.type]: filter.value,
    };

    return _set(
      {},
      filter.key,
      filter.negate ? { ["$not"]: filterValue } : filterValue
    );
  }

  private static _parseFilters<Md extends object>(
    rawFilters: StrapiRawFilters<Md>
  ): any | undefined {
    const attributeFilters = rawFilters?.attributeFilters || [];
    const rootLogical = rawFilters?.rootLogical || "$and";
    const negateRoot = rawFilters?.negate || false;

    const parsedFilters: any[] = [];
    attributeFilters.forEach((attributeQuery) => {
      const parsedAttribute = QQBuilder._parseAttributeFilter(attributeQuery);
      if (!_isDefined(parsedAttribute)) return;
      parsedFilters.push(parsedAttribute);
    });

    if (parsedFilters.length === 0) return undefined;

    const filters = {
      [rootLogical]: parsedFilters,
    };
    return negateRoot ? { ["$not"]: filters } : filters;
  }

  private static _parsePopulate<Md extends object, Dt extends object>(
    populates: StrapiPopulations<Md, Dt>
  ): any | undefined {
    if (populates.size === 0) return undefined;

    const allPopulate = populates.get("*");
    if (_isDefined(allPopulate)) return "*";

    let parsedPopulates: any = {};

    populates.forEach((populate) => {
      if (populate.dynamicQuery) {
        const unparsedDynamicZone = populate.dynamicQuery;
        const parsedDynamicZone: any = {};
        for (const key of Object.keys(unparsedDynamicZone)) {
          parsedDynamicZone[key] = QQBuilder._buildQuery(
            unparsedDynamicZone[key]
          );
        }
        parsedPopulates[populate.key] = { on: parsedDynamicZone };
      } else if (populate.nestedQuery) {
        parsedPopulates[populate.key] = QQBuilder._buildQuery(
          populate.nestedQuery
        );
      } else {
        parsedPopulates[populate.key] = true;
      }
    });

    return parsedPopulates;
  }
  //</editor-fold>

  //<editor-fold desc="Protected utils">
  protected getRawFilters(): StrapiRawFilters<Model> {
    return this._query.filters;
  }
  protected getRawFields(): StrapiFields<Model> {
    return this._query.fields;
  }
  protected getRawSort(): StrapiSorts<Model> {
    return this._query.sort;
  }
  protected getRawPopulation(): StrapiPopulations<Model, any> {
    return this._query.population;
  }
  protected getRawPagination(): StrapiPagination | undefined {
    return this._query.pagination;
  }
  //</editor-fold>
}

// <editor-fold desc="Output specific type utils">
type QQBuilderCallback<
  Model extends object,
  Data extends object,
  Config extends InternalBuilderConfig
> = () => QQBuilder<Model, Data, Config>;

type ParseQQBuilderPopulates<
  P extends Record<string, any>,
  PopulateAll extends boolean
> = keyof P extends never ? never : PopulateAll extends true ? "*" : P;

type BuildQQCallback<Config extends InternalBuilderConfig> = {
  fields: ParseList<Config["fields"]>;
  sort: ParseList<Config["sort"]>;
  filters: ParseFilters<
    Config["filters"],
    Config["rootLogical"],
    Config["negate"]
  >;
  populate: ParseQQBuilderPopulates<Config["populates"], Config["populateAll"]>;
} extends infer Result
  ? {
      [K in keyof Result as Result[K] extends never ? never : K]: Result[K];
    }
  : never;

type BuildQQOutput<Config extends InternalBuilderConfig> = {
  fields: ParseList<Config["fields"]>;
  sort: ParseList<Config["sort"]>;
  filters: ParseFilters<
    Config["filters"],
    Config["rootLogical"],
    Config["negate"]
  >;
  populate: ParseQQBuilderPopulates<Config["populates"], Config["populateAll"]>;
  page: Config["paginationType"] extends "page"
    ? Config["pagination"]["page"]
    : never;
  pageSize: Config["paginationType"] extends "page"
    ? Config["pagination"]["pageSize"]
    : never;
  start: Config["paginationType"] extends "limit"
    ? Config["pagination"]["page"]
    : never;
  limit: Config["paginationType"] extends "limit"
    ? Config["pagination"]["pageSize"]
    : never;
  publicationState: Config["publicationState"] extends PublicationStates
    ? Config["publicationState"]
    : never;
  locale: Config["locale"] extends string ? Config["locale"] : never;
  data: Config["data"];
} extends infer Result
  ? {
      [K in keyof Result as Result[K] extends never ? never : K]: Result[K];
    }
  : never;
// </editor-fold>
