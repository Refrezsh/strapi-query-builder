import { _isDefined, _set } from "./query-utils";
import {
  EntityFilterAttributes,
  FilterOperatorKey,
  GetAttributeType,
  MultipleAttributeType,
  OnType,
  ParseFilters,
  ParseList,
  QueryRawInfo,
  SingleAttributeType,
  SortKey,
  StrapiAttributesFilter,
  StrapiFields,
  StrapiInputPopulateKey,
  StrapiPopulate,
  StrapiPopulations,
  StrapiRawFilters,
  StrapiSingleFieldInput,
  StrapiSortOptions,
  StrapiSorts,
  StrapiUnionPagination,
  TransformNestedKey,
  TransformNestedKeys,
} from "./query-types-util";

export class QQBuilder<
  Model extends object,
  Data extends object = {},
  Config extends QueryEngineBuilderConfig = InitialBuildConfig
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
   * new QQBuilder<Model>().fields(["name", "type"] as const);
   * // { select: ["name", "type"] }
   * @param {StrapiSingleFieldInput[]} fields List of fields
   */
  public fields<F extends readonly StrapiSingleFieldInput<Model>[]>(fields: F) {
    const currentFields = this._query.fields;
    const fieldsLength = fields.length;

    for (let i = 0; i < fieldsLength; i++) {
      const field = fields[i];
      currentFields.add(field);
    }

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
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Select specific field
   * @description Same keys will be merged
   * @example
   * new QQBuilder<Model>().field("key");
   * // { select: ["key"] }
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
   * new QQBuilder<Model>().sortAsc("attribute");
   * // { orderBy: [{"attribute": "asc"}] }
   * @example
   * new QQBuilder<Model>().sortAsc("parentKey.childKey");
   * // { orderBy: [{"parentKey": { "childKey": "asc" }}]}
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
   * new QQBuilder<Model>().sortDesc("attribute");
   * // { orderBy: [{"attribute": "desc"}] }
   * @example
   * new QQBuilder<Model>().sortDesc("parentKey.childKey");
   * // { orderBy: [{"parentKey": { "childKey": "desc" }}]}
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
   * new QQBuilder<Model>().sortsAsc(["attribute1", "attribute2"] as const);
   * // { orderBy: [{"attribute1": "asc"}, {"attribute2": "asc"}] }
   */
  public sortsAsc<K extends readonly SortKey<Model>[]>(attributes: K) {
    return this.sorts(attributes, "asc");
  }

  /**
   * @description Sort results by attributes list in descending order
   * @description Same keys will be merged
   * @description Allowed "attribute.dot" notation
   * @param {SortKey[]} attributes Attributes list
   * @example
   * new QQBuilder<Model>().sortsDesc(["attribute1", "attribute2"] as const);
   * // { orderBy: [{"attribute1": "desc"}, {"attribute2": "desc"}] }
   */
  public sortsDesc<K extends readonly SortKey<Model>[]>(attributes: K) {
    return this.sorts(attributes, "desc");
  }

  /**
   * @description Sort results by attribute and direction
   * @description Same keys will be merged
   * @description Allowed "attribute.dot" notation
   * @param {SortKey} attribute Attribute
   * @param {StrapiSortOptions} direction Direction "asc" ord "desc"
   * @example
   * new QQBuilder<Model>().sort("attribute", "asc");
   * // { orderBy: [{"attribute": "asc"}] }
   */
  public sort<K extends SortKey<Model>, D extends StrapiSortOptions>(
    attribute: K,
    direction: D
  ) {
    this._query.sort.set(attribute, { key: attribute, order: direction });
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
   * new QQBuilder<Model>().sorts(["attribute1", "attribute2"] as const, "desc");
   * // { orderBy: [{"attribute1": "desc"}, {"attribute2": "desc"}] }
   */
  public sorts<
    K extends readonly SortKey<Model>[],
    D extends StrapiSortOptions
  >(attributes: K, direction: D) {
    const currentSorts = this._query.sort;

    const attributesLength = attributes.length;
    for (let i = 0; i < attributesLength; i++) {
      const attribute = attributes[i];
      currentSorts.set(attribute, { key: attribute, order: direction });
    }

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
   * new QQBuilder<Model>().or();
   * // { where: { $or: [...] }}
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
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Change root logical to "$and"
   * @description Default - "$and"
   * @example
   * new QQBuilder<Model>().and();
   * // { where: { $and: [...] }}
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
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Add "$not" before root logical
   * @description Default - false
   * @example
   * new QQBuilder<Model>().not();
   * // { where: { $not: { $and: [...] }}}
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
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Add deep filters for current model
   * @example
   * new QQBuilder<TestModel>()
   *     .eq("options", "value")
   *     .filterDeep(() =>
   *       new QQBuilder<TestModel>().or().eq("name", "value1").eq("name", "value2")
   *     )
   * // {
   * //    where: {
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
  public filterDeep<DeepConfig extends QueryEngineBuilderConfig>(
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
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Add related model filters
   * @example
   * new QQBuilder<TestModel>()
   *       .filterRelation("nested", () =>
   *         new QQBuilder<NestedModel>().eq("id", "value")
   *       )
   * // {
   * //      where: {
   * //        $and: [{ nested: { $and: [{ id: { $eq: "value" } }] } }];
   * //      }
   * // }
   * @param {FilterOperatorKey} attribute Attribute
   * @param {QQBuilderCallback} builderFactory Fabric function that returns builder with filters for relation model
   */
  public filterRelation<
    RelationModel extends object,
    K extends FilterOperatorKey<Model>,
    RelationConfig extends QueryEngineBuilderConfig
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
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Attribute equals input value
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new QQBuilder<Model>().eq("attribute", "value");
   * // { where: { $and: [{ attribute: { $eq: "value" }} ] }}
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
   * new QQBuilder<Model>().notEq("key", "value");
   * // { where: { $and: [{ attribute: { $not: { $eq: "value" } }} ] }}
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
   * new QQBuilder<Model>().eqi("attribute", "value");
   * // { where: { $and: [{ attribute: { $eqi: "value" }} ] }}
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
   * new QQBuilder<Model>().notEqi("attribute", "value");
   * // { where: { $and: [{ attribute: { $not: { $eqi: "value" }}} ] }}
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
   * new QQBuilder<Model>().ne("attribute", "value");
   * // { where: { $and: [{ attribute: { $ne: "value" }} ] }}
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
   * new QQBuilder<Model>().nei("attribute", "value");
   * // { where: { $and: [{ attribute: { $nei: "value" }} ] }}
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
   * new QQBuilder<Model>().contains("attribute", "value");
   * // { where: { $and: [{ attribute: { $contains: "value" }} ] }}
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
   * new QQBuilder<Model>().notContains("attribute", "value");
   * // { where: { $and: [{ attribute: { $notContains: "value" }} ] }}
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
   * new QQBuilder<Model>().containsi("attribute", "value");
   * // { where: { $and: [{ attribute: { $containsi: "value" }} ] }}
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
   * new QQBuilder<Model>().notContainsi("attribute", "value");
   * // { where: { $and: [{ attribute: { $notContainsi: "value" }} ] }}
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
   * new QQBuilder<Model>().in("attribute", ["value1", "value2"]);
   * // { where: { $and: [{ attribute: { $in: ["value1", "value2"] }} ] }}
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
   * new QQBuilder<Model>().notIn("attribute", ["value1", "value2"]);
   * // { where: { $and: [{ attribute: { $notIn: ["value1", "value2"] }} ] }}
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
   * new QQBuilder<Model>().between("attribute", ["value1", "value2"]);
   * // { where: { $and: [{ attribute: { $between: ["value1", "value2"] }} ] }}
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
   * new QQBuilder<Model>().notBetween("attribute", ["value1", "value2"]);
   * // { where: { $and: [{ attribute: { $not: { $between: ["value1", "value2"] }}} ] }}
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
   * new QQBuilder<Model>().lt("attribute", "value");
   * // { where: { $and: [{ attribute: { $lt: "value" }} ] }}
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
   * new QQBuilder<Model>().notLt("attribute", "value");
   * // { where: { $and: [{ attribute: { $not: { $lt: "value" }}} ] }}
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
   * new QQBuilder<Model>().lte("attribute", "value");
   * // { where: { $and: [{ attribute: { $lte: "value" }} ] }}
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
   * new QQBuilder<Model>().notLte("attribute", "value");
   * // { where: { $and: [{ attribute: { $not: { $lte: "value" }}} ] }}
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
   * new QQBuilder<Model>().gt("attribute", "value");
   * // { where: { $and: [{ attribute: { $gt: "value" }} ] }}
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
   * new QQBuilder<Model>().notGt("attribute", "value");
   * // { where: { $and: [{ attribute: { $not: { $gt: "value" }}} ] }}
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
   * new QQBuilder<Model>().gte("attribute", "value");
   * // { where: { $and: [{ attribute: { $gte: "value" }} ] }}
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
   * new QQBuilder<Model>().notGte("attribute", "value");
   * // { where: { $and: [{ attribute: { $not: { $gte: "value" }}} ] }}
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
   * new QQBuilder<Model>().startsWith("attribute", "value");
   * // { where: { $and: [{ attribute: { $startsWith: "value" }} ] }}
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
   * new QQBuilder<Model>().notStartsWith("attribute", "value");
   * // { where: { $and: [{ attribute: { $not: { $startsWith: "value" }}} ] }}
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
   * new QQBuilder<Model>().endsWith("attribute", "value");
   * // { where: { $and: [{ attribute: { $endsWith: "value" }} ] }}
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
   * new QQBuilder<Model>().notEndsWith("attribute", "value");
   * // { where: { $and: [{ attribute: { $not: { $endsWith: "value" }}} ] }}
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
   * new QQBuilder<Model>().null("attribute", "value");
   * // { where: { $and: [{ attribute: { $null: "value" }} ] }}
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
   * new QQBuilder<Model>().notNull("attribute", "value");
   * // { where: { $and: [{ attribute: { $notNull: "value" }} ] }}
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
   * new QQBuilder<Model>().filter("attribute", "$eq", "value");
   * // { where: { $and: [{ attribute: { $eq: "value" }} ] }}
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
   * new QQBuilder<Model>().filterNot("attribute", "$eq", "value");
   * // { where: { $and: [{ attribute: { $not: { $eq: "value" }}} ] }}
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
   * new QQBuilder<Model>().populateAll();
   * // { populate: true }
   */
  public populateAll() {
    this._query.population.set("*", { key: "*" });
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
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Populate all model by attribute
   * @description Same keys will be overriding by last operator
   * @param {StrapiInputPopulateKey} attribute Attribute
   * @example
   * new QQBuilder<Model>().populate("relation");
   * // { populate: { relation: true } }
   */
  public populate<K extends StrapiInputPopulateKey<Model>>(attribute: K) {
    this._query.population.set(attribute, { key: attribute });
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
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Populate all models by attributes list
   * @description Same keys will be overriding by last operator
   * @param {StrapiInputPopulateKey[]} attributes Attributes list
   * @example
   * new QQBuilder<Model>().populates(["relation1", "relation2"]);
   * // { populate: { relation1: true, relation2: true } }
   */
  public populates<K extends readonly StrapiInputPopulateKey<Model>[]>(
    attributes: K
  ) {
    const populate = this._query.population;

    const attributesLength = attributes.length;
    for (let i = 0; i < attributesLength; i++) {
      const attribute = attributes[i];
      populate.set(attribute, { key: attribute });
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
          [P in keyof Config["populates"] | K[number]]: P extends K[number]
            ? true
            : P extends keyof Config["populates"]
            ? Config["populates"][P]
            : never;
        };
        pagination: Config["pagination"];
        paginationType: Config["paginationType"];
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
   * new QQBuilder<TestModel>()
   *       .populateRelation("nested", () =>
   *         new QQBuilder<NestedModel>().eq("id", "value").field("id")
   *       )
   * //     populate: {
   * //       nested: {
   * //         select: ["id"];
   * //         where: { $and: [{ id: { $eq: "value" } }] };
   * //       }
   * //     }
   */
  public populateRelation<
    PopulateModel extends object,
    K extends StrapiInputPopulateKey<Model>,
    RelationConfig extends QueryEngineBuilderConfig
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

    this._query.population.set(attribute, populate);
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
   * new QQBuilder<TestModel>()
   *       .populateDynamic("nested", "component.1", () =>
   *         new QQBuilder<NestedModel>().eq("id", "value")
   *       )
   *       .populateDynamic("nested", "component.2", () =>
   *         new QQBuilder<NestedModel>().notEq("id", "value3")
   *       )
   * //      populate: {
   * //       nested: {
   * //         on: {
   * //           "component.1": { where: { $and: [{ id: { $eq: "value" } }] } };
   * //           "component.2": {
   * //             where: { $and: [{ id: { $not: { $eq: "value3" } } }] };
   * //           };
   * //         };
   * //       };
   * //     };
   */
  public populateDynamic<
    PopulateModel extends object,
    K extends StrapiInputPopulateKey<Model>,
    C extends string,
    RelationConfig extends QueryEngineBuilderConfig
  >(
    attribute: K,
    componentKey: C,
    builderFactory: QQBuilderCallback<PopulateModel, {}, RelationConfig>
  ) {
    const populateBuilder = builderFactory();
    const populate = this._query.population;

    const currentQuery = populate.get(attribute);
    const currentDynamic = currentQuery?.dynamicQuery || {};
    const newQuery = {
      componentKey: componentKey,
      fields: populateBuilder.getRawFields(),
      sort: populateBuilder.getRawSort(),
      population: populateBuilder.getRawPopulation(),
      filters: populateBuilder.getRawFilters(),
    };

    currentDynamic[componentKey] = newQuery;

    populate.set(attribute, {
      key: attribute,
      dynamicQuery: currentDynamic,
    });

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
        data: Config["data"];
      }
    >;
  }
  //</editor-fold>

  //<editor-fold desc="Pagination">
  /**
   * @description Pagination by offset, when defining the start parameter
   * @param {number} start
   * @example
   * new QQBuilder<TestModel>().start(5)
   * // { offset: 5; }
   */
  public start<Start extends number>(start: Start) {
    if (!this._query.pagination) {
      this._query.pagination = {
        page: start,
        pageSize: undefined,
        paginationType: "limit",
      };
    } else {
      this._query.pagination.page = start;
      this._query.pagination.paginationType = "limit";
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
        pagination: { page: Start; pageSize: Config["pagination"]["pageSize"] };
        paginationType: "limit";
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Pagination by offset, when defining the limit parameter
   * @param {number} limit
   * @example
   * new QQBuilder<TestModel>().limit(20)
   * // { limit: 20; }
   */
  public limit<Limit extends number>(limit: Limit) {
    if (!this._query.pagination) {
      this._query.pagination = {
        page: undefined,
        pageSize: limit,
        paginationType: "limit",
      };
    } else {
      this._query.pagination.pageSize = limit;
      this._query.pagination.paginationType = "limit";
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
        pagination: { page: Config["pagination"]["page"]; pageSize: Limit };
        paginationType: "limit";
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
   * new QQBuilder<TestModel, TestModel>().data({ id: 1 })
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
  public joinFields<DeepConfig extends QueryEngineBuilderConfig>(
    builder: QQBuilder<Model, {}, DeepConfig>
  ) {
    const currentFields = this._query.fields;
    const newFields = builder.getRawFields().values();

    for (const field of newFields) {
      currentFields.add(field);
    }

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
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Attach sorts from other query builder
   * @description Same keys will be merged
   * @param {QQBuilder} builder Embedded builder
   */
  public joinSort<DeepConfig extends QueryEngineBuilderConfig>(
    builder: QQBuilder<Model, {}, DeepConfig>
  ) {
    const currentSorts = this._query.sort;
    const joinSortsValues = builder.getRawSort().values();

    for (let value of joinSortsValues) {
      currentSorts.set(value.key, value);
    }

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
    DeepConfig extends QueryEngineBuilderConfig,
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
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Attach populates from other query builder
   * @description Same keys will be overwritten
   * @param {QQBuilder} builder Embedded builder
   */
  public joinPopulate<DeepConfig extends QueryEngineBuilderConfig>(
    builder: QQBuilder<Model, {}, DeepConfig>
  ) {
    const currentPopulate = this._query.population;
    const newPopulateValues = builder.getRawPopulation().values();

    for (const populate of newPopulateValues) {
      currentPopulate.set(
        populate.key,
        populate as unknown as StrapiPopulate<Model, any>
      );
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
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Attach pagination from other query builder
   * @param {QQBuilder} builder Embedded builder
   */
  public joinPagination<DeepConfig extends QueryEngineBuilderConfig>(
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
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Join query from other query builder to current query builder
   * @param {QQBuilder} builder Embedded builder
   */
  public joinQuery<DeepConfig extends QueryEngineBuilderConfig>(
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
        data: Config["data"];
      }
    >;
  }
  //</editor-fold>

  //<editor-fold desc="Build process">
  /**
   * @description Build the current query into the final Query Engine format
   * @return Query with dynamically generated query type
   */
  public build() {
    return QQBuilder._buildQuery(this._query) as BuildQQOutput<Config>;
  }

  private static _buildQuery<Md extends object, Dt extends object>(
    rawQuery: QueryRawInfo<Md, Dt>
  ) {
    const builtQuery: any = {};

    const parsedFields =
      rawQuery.fields.size > 0 ? [...rawQuery.fields] : undefined;
    if (_isDefined(parsedFields)) {
      builtQuery.select = parsedFields;
    }

    const parsedSort = QQBuilder._parseSort(rawQuery.sort);
    if (parsedSort.length > 0) {
      builtQuery.orderBy = parsedSort;
    }

    const parsedFilters = QQBuilder._parseFilters(rawQuery.filters);
    if (_isDefined(parsedFilters)) {
      builtQuery.where = parsedFilters;
    }

    const parsedPopulation = QQBuilder._parsePopulate(rawQuery.population);
    if (_isDefined(parsedPopulation)) {
      builtQuery.populate = parsedPopulation;
    }

    const pagination = rawQuery.pagination;
    if (_isDefined(pagination)) {
      if (_isDefined(pagination.page)) {
        builtQuery.offset = pagination.page;
      }
      if (_isDefined(pagination.pageSize)) {
        builtQuery.limit = pagination.pageSize;
      }
    }

    const data = rawQuery.data;
    if (_isDefined(data)) {
      builtQuery.data = data;
    }

    return builtQuery;
  }

  private static _parseSort<Md extends object>(sorts: StrapiSorts<Md>) {
    const sortQuery: any[] = [];
    const sortValues = sorts.values();
    for (let sort of sortValues) {
      sortQuery.push(_set({}, sort.key, sort.order));
    }
    return sortQuery;
  }

  private static _parseAttributeFilter<Md extends object>(
    filter: StrapiAttributesFilter<Md>
  ): any | undefined {
    const nestedFilters = filter.nested;
    const filterKey = filter.key;

    if (nestedFilters !== undefined) {
      const parsedNestedFilters = this._parseFilters(nestedFilters);
      if (!_isDefined(parsedNestedFilters)) return undefined;

      return !_isDefined(filterKey)
        ? parsedNestedFilters
        : _set({}, filterKey, parsedNestedFilters);
    }

    const filterType = filter.type;
    const filterValue = filter.value;
    const filterNegate = filter.negate;

    if (
      !_isDefined(filterKey) ||
      !_isDefined(filterType) ||
      !_isDefined(filterValue)
    ) {
      return undefined;
    }

    const filterOperator = {
      [filterType]: filterValue,
    };

    return _set(
      {},
      filterKey,
      filterNegate ? { ["$not"]: filterOperator } : filterOperator
    );
  }

  private static _parseFilters<Md extends object>(
    rawFilters: StrapiRawFilters<Md>
  ): any | undefined {
    const attributeFilters = rawFilters?.attributeFilters || [];
    const rootLogical = rawFilters?.rootLogical || "$and";
    const negateRoot = rawFilters?.negate || false;
    const filtersLength = attributeFilters.length;

    if (filtersLength === 0) return undefined;

    const parsedFilters: any[] = [];
    for (let i = 0; i < filtersLength; i++) {
      const attributeQuery = attributeFilters[i];
      const parsedAttribute = QQBuilder._parseAttributeFilter(attributeQuery);
      if (!_isDefined(parsedAttribute)) continue;
      parsedFilters.push(parsedAttribute);
    }
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
    if (_isDefined(allPopulate)) return true;

    let parsedPopulates: any = {};

    const unparsedPopulates = populates.values();
    for (const populate of unparsedPopulates) {
      const populateKey = populate.key;
      const dynamicQuery = populate.dynamicQuery;
      const nestedQuery = populate.nestedQuery;

      if (dynamicQuery) {
        const parsedDynamicZone: any = {};
        const unparsedDynamicZone = Object.values(dynamicQuery);

        for (const dynamicComponent of unparsedDynamicZone) {
          const componentKey = dynamicComponent.componentKey;
          parsedDynamicZone[componentKey] =
            QQBuilder._buildQuery(dynamicComponent);
        }

        parsedPopulates[populateKey] = { on: parsedDynamicZone };
      } else if (nestedQuery) {
        parsedPopulates[populateKey] = QQBuilder._buildQuery(nestedQuery);
      } else {
        parsedPopulates[populateKey] = true;
      }
    }

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
  protected getRawPagination(): StrapiUnionPagination | undefined {
    return this._query.pagination;
  }
  //</editor-fold>
}

// <editor-fold desc="Specific query type utils">
type QueryEngineBuilderConfig = {
  fields: unknown[];
  sort: unknown[];
  filters: unknown[];
  rootLogical: "$and" | "$or";
  negate: boolean;
  populateAll: boolean;
  populates: Record<string, any>;
  pagination: { page?: number; pageSize?: number };
  paginationType: "limit";
  data: unknown;
};

type InitialBuildConfig = {
  fields: [];
  sort: [];
  filters: [];
  rootLogical: "$and";
  negate: false;
  populateAll: false;
  populates: {};
  pagination: { page: never; pageSize: never };
  paginationType: never;
  data: never;
};

type QQBuilderCallback<
  Model extends object,
  Data extends object,
  Config extends QueryEngineBuilderConfig
> = () => QQBuilder<Model, Data, Config>;

type ParseQQBuilderPopulates<
  P extends Record<string, any>,
  PopulateAll extends boolean
> = keyof P extends never ? never : PopulateAll extends true ? true : P;

type BuildQQCallback<Config extends QueryEngineBuilderConfig> = {
  select: ParseList<Config["fields"]>;
  orderBy: ParseList<Config["sort"]>;
  where: ParseFilters<
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

type BuildQQOutput<Config extends QueryEngineBuilderConfig> = {
  select: ParseList<Config["fields"]>;
  orderBy: ParseList<Config["sort"]>;
  where: ParseFilters<
    Config["filters"],
    Config["rootLogical"],
    Config["negate"]
  >;
  populate: ParseQQBuilderPopulates<Config["populates"], Config["populateAll"]>;
  offset: Config["paginationType"] extends "limit"
    ? Config["pagination"]["page"]
    : never;
  limit: Config["paginationType"] extends "limit"
    ? Config["pagination"]["pageSize"]
    : never;
  data: Config["data"];
} extends infer Result
  ? {
      [K in keyof Result as Result[K] extends never ? never : K]: Result[K];
    }
  : never;
// </editor-fold>
