import { _isDefined, _set } from "./query-utils";
import {
  EntityFilterAttributes,
  FilterOperatorKey,
  FilterRelationKey,
  GetAttributeType,
  MultipleAttributeType,
  OnType,
  ParseFilters,
  ParseList,
  PublicationStates,
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
} from "./query-types-util";

export class RQBuilder<
  Model extends object,
  Data extends object = {},
  Config extends EntityBuilderConfig = InitialBuildConfig
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
   * new RQBuilder<Model>().fields(["name", "type"] as const);
   * // { fields: ["name", "type"] }
   * @param {StrapiSingleFieldInput[]} fields List of fields
   */
  public fields<F extends readonly StrapiSingleFieldInput<Model>[]>(fields: F) {
    const currentFields = this._query.fields;
    const fieldsLength = fields.length;

    for (let i = 0; i < fieldsLength; i++) {
      currentFields.add(fields[i]);
    }

    return this as unknown as RQBuilder<
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
   * new RQBuilder<Model>().field("key");
   * // { fields: ["key"] }
   * @param {StrapiSingleFieldInput} field Single field
   */
  public field<F extends StrapiSingleFieldInput<Model>>(field: F) {
    this._query.fields.add(field);
    return this as unknown as RQBuilder<
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
   * @param {SortKey} attribute Attribute
   * @example
   * new RQBuilder<Model>().sortAsc("attribute");
   * // { sort: ["attribute:asc"] }
   * @example
   * new RQBuilder<Model>().sortAsc("parentKey.childKey");
   * // { sort: ["parentKey.childKey:asc"] }
   */
  public sortAsc<K extends SortKey<Model>>(attribute: K) {
    return this.sort(attribute, "asc");
  }

  /**
   * @description Sort results by attribute in descending order
   * @description Same keys will be merged
   * @param {SortKey} attribute Attribute
   * @example
   * new RQBuilder<Model>().sortDesc("attribute");
   * // { sort: ["attribute:desc"] }
   * @example
   * new RQBuilder<Model>().sortDesc("parentKey.childKey");
   * // { sort: ["parentKey.childKey:desc"] }
   */
  public sortDesc<K extends SortKey<Model>>(attribute: K) {
    return this.sort(attribute, "desc");
  }

  /**
   * @description Sort results by attributes list in ascending order
   * @description Same keys will be merged
   * @param {SortKey[]} attributes Attributes list
   * @example
   * new RQBuilder<Model>().sortsAsc(["attribute1", "attribute2"] as const);
   * // { sort: ["attribute1:asc", "attribute2:asc"] }
   */
  public sortsAsc<K extends readonly SortKey<Model>[]>(attributes: K) {
    return this.sorts(attributes, "asc");
  }

  /**
   * @description Sort results by attributes list in descending order
   * @description Same keys will be merged
   * @param {SortKey[]} attributes Attributes list
   * @example
   * new RQBuilder<Model>().sortsDesc(["attribute1", "attribute2"] as const);
   * // { sort: ["attribute1:desc", "attribute2:desc"] }
   */
  public sortsDesc<K extends readonly SortKey<Model>[]>(attributes: K) {
    return this.sorts(attributes, "desc");
  }

  /**
   * @description Sort results by attribute and direction
   * @description Same keys will be merged
   * @param {SortKey} attribute Attribute
   * @param {StrapiSortOptions} direction Direction "asc" ord "desc"
   * @example
   * new RQBuilder<Model>().sort("attribute", "asc");
   * // { sort: ["attribute:asc"] }
   */
  public sort<K extends SortKey<Model>, D extends StrapiSortOptions>(
    attribute: K,
    direction: D
  ) {
    this._query.sort.set(attribute, { key: attribute, order: direction });
    return this as unknown as RQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: [...Config["sort"], `${K}:${D}`];
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
   * new RQBuilder<Model>().sorts(["attribute1", "attribute2"] as const, "desc");
   * // { sort: ["attribute1:desc", "attribute2:desc"] }
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

    return this as unknown as RQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: [...Config["sort"], ...GetSortKeys<K, D>];
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
   * new RQBuilder<Model>().or();
   * // { filters: { $or: [...] }}
   */
  public or() {
    this._query.filters.rootLogical = "$or";
    return this as unknown as RQBuilder<
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
   * new RQBuilder<Model>().and();
   * // { filters: { $and: [...] }}
   */
  public and() {
    this._query.filters.rootLogical = "$and";
    return this as unknown as RQBuilder<
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
   * new RQBuilder<Model>().not();
   * // { filters: { $not: { $and: [...] }}}
   */
  public not() {
    this._query.filters.negate = true;
    return this as unknown as RQBuilder<
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
   * new RQBuilder<TestModel>()
   *     .eq("options", "value")
   *     .filterDeep(() =>
   *       new RQBuilder<TestModel>().or().eq("name", "value1").eq("name", "value2")
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
   * @param {RQBuilderCallback} builderFactory Fabric function that returns builder with filters for current model
   */
  public filterDeep<DeepConfig extends EntityBuilderConfig>(
    builderFactory: RQBuilderCallback<Model, {}, DeepConfig>
  ) {
    const deepBuilder = builderFactory();
    this._query.filters.attributeFilters.push({
      nested: deepBuilder.getRawFilters() as unknown as StrapiRawFilters<{}>,
    });

    return this as unknown as RQBuilder<
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
   * new RQBuilder<TestModel>()
   *       .filterRelation("nested", () =>
   *         new RQBuilder<NestedModel>().eq("id", "value")
   *       )
   * // {
   * //      filters: {
   * //        $and: [{ nested: { $and: [{ id: { $eq: "value" } }] } }];
   * //      }
   * // }
   * @param {FilterRelationKey} attribute Attribute
   * @param {RQBuilderCallback} builderFactory Fabric function that returns builder with filters for relation model
   */
  public filterRelation<
    RelationModel extends object,
    K extends FilterRelationKey<Model>,
    RelationConfig extends EntityBuilderConfig
  >(
    attribute: K,
    builderFactory: RQBuilderCallback<RelationModel, {}, RelationConfig>
  ) {
    const relationBuilder = builderFactory();
    this._query.filters.attributeFilters.push({
      key: attribute,
      nested:
        relationBuilder.getRawFilters() as unknown as StrapiRawFilters<{}>,
    });

    return this as unknown as RQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: [
          ...Config["filters"],
          {
            [R in K]: ParseFilters<
              RelationConfig["filters"],
              RelationConfig["rootLogical"],
              RelationConfig["negate"]
            >;
          }
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
   * new RQBuilder<Model>().eq("attribute", "value");
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
   * new RQBuilder<Model>().notEq("key", "value");
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
   * new RQBuilder<Model>().eqi("attribute", "value");
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
   * new RQBuilder<Model>().notEqi("attribute", "value");
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
   * new RQBuilder<Model>().ne("attribute", "value");
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
   * new RQBuilder<Model>().nei("attribute", "value");
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
   * new RQBuilder<Model>().contains("attribute", "value");
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
   * new RQBuilder<Model>().notContains("attribute", "value");
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
   * new RQBuilder<Model>().containsi("attribute", "value");
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
   * new RQBuilder<Model>().notContainsi("attribute", "value");
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
   * new RQBuilder<Model>().in("attribute", ["value1", "value2"]);
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
   * new RQBuilder<Model>().notIn("attribute", ["value1", "value2"]);
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
   * new RQBuilder<Model>().between("attribute", ["value1", "value2"]);
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
   * new RQBuilder<Model>().notBetween("attribute", ["value1", "value2"]);
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
   * new RQBuilder<Model>().lt("attribute", "value");
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
   * new RQBuilder<Model>().notLt("attribute", "value");
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
   * new RQBuilder<Model>().lte("attribute", "value");
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
   * new RQBuilder<Model>().notLte("attribute", "value");
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
   * new RQBuilder<Model>().gt("attribute", "value");
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
   * new RQBuilder<Model>().notGt("attribute", "value");
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
   * new RQBuilder<Model>().gte("attribute", "value");
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
   * new RQBuilder<Model>().notGte("attribute", "value");
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
   * new RQBuilder<Model>().startsWith("attribute", "value");
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
   * @description Attribute starts with input value (case-insensitive)
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new RQBuilder<Model>().startsWithi("attribute", "value");
   * // { filters: { $and: [{ attribute: { $startsWithi: "value" }} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {SingleAttributeType} value Filter by value
   */
  public startsWithi<
    K extends FilterOperatorKey<Model>,
    V extends SingleAttributeType
  >(attribute: K, value: V) {
    return this.filter(attribute, "$startsWithi", value);
  }

  /**
   * @description Attribute not starts with input value
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new RQBuilder<Model>().notStartsWith("attribute", "value");
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
   * @description Attribute not starts with input value (case-insensitive)
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new RQBuilder<Model>().notStartsWithi("attribute", "value");
   * // { filters: { $and: [{ attribute: { $not: { $startsWithi: "value" }}} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {SingleAttributeType} value Filter by value
   */
  public notStartsWithi<
    K extends FilterOperatorKey<Model>,
    V extends SingleAttributeType
  >(attribute: K, value: V) {
    return this.filterNot(attribute, "$startsWithi", value);
  }

  /**
   * @description Attribute ends with input value
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new RQBuilder<Model>().endsWith("attribute", "value");
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
   * @description Attribute ends with input value (case-insensitive)
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new RQBuilder<Model>().endsWithi("attribute", "value");
   * // { filters: { $and: [{ attribute: { $endsWithi: "value" }} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {SingleAttributeType} value Filter by value
   */
  public endsWithi<
    K extends FilterOperatorKey<Model>,
    V extends SingleAttributeType
  >(attribute: K, value: V) {
    return this.filter(attribute, "$endsWithi", value);
  }

  /**
   * @description Attribute not ends with input value
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new RQBuilder<Model>().notEndsWith("attribute", "value");
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
   * @description Attribute not ends with input value (case-insensitive)
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new RQBuilder<Model>().notEndsWithi("attribute", "value");
   * // { filters: { $and: [{ attribute: { $not: { $endsWithi: "value" }}} ] }}
   * @param {FilterOperatorKey} attribute Attribute
   * @param {SingleAttributeType} value Filter by value
   */
  public notEndsWithi<
    K extends FilterOperatorKey<Model>,
    V extends SingleAttributeType
  >(attribute: K, value: V) {
    return this.filterNot(attribute, "$endsWithi", value);
  }

  /**
   * @description Attribute is null
   * @description Same keys will not be merged
   * @description Allowed "attribute.dot" notation
   * @example
   * new RQBuilder<Model>().null("attribute", "value");
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
   * new RQBuilder<Model>().notNull("attribute", "value");
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
   * new RQBuilder<Model>().filter("attribute", "$eq", "value");
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

    return this as unknown as RQBuilder<
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
   * new RQBuilder<Model>().filterNot("attribute", "$eq", "value");
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

    return this as unknown as RQBuilder<
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
   * new RQBuilder<Model>().populateAll();
   * // { populate: "*" }
   */
  public populateAll() {
    this._query.population.set("*", { key: "*" });
    return this as unknown as RQBuilder<
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
   * @description Rest API query builder can't create array of population string. Instead, it creates a key with the value { populate: “*” }
   * @description Same keys will be overriding by last operator
   * @param {StrapiInputPopulateKey} attribute Attribute
   * @example
   * new RQBuilder<Model>().populate("relation");
   * // { populate: { relation: { populate: "*" } } }
   */
  public populate<K extends StrapiInputPopulateKey<Model>>(attribute: K) {
    this._query.population.set(attribute, { key: attribute });
    return this as unknown as RQBuilder<
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
            ? { populate: "*" }
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
   * @description Rest API query builder can't create array of population string. Instead, it creates a key with the value { populate: “*” }
   * @description Same keys will be overriding by last operator
   * @param {StrapiInputPopulateKey[]} attributes Attributes list
   * @example
   * new RQBuilder<Model>().populates(["relation1", "relation2"]);
   * // { populate: { relation1: { populate: "*" }, relation2: { populate: "*" } } }
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

    return this as unknown as RQBuilder<
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
            ? { populate: "*" }
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
   * @param {RQBuilderCallback} builderFactory Fabric function that returns builder with filters, sort, fields and other deep populate builders for Relation Model
   * @example
   * new RQBuilder<TestModel>()
   *       .populateRelation("nested", () =>
   *         new RQBuilder<NestedModel>().eq("id", "value").field("id")
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
    RelationConfig extends EntityBuilderConfig
  >(
    attribute: K,
    builderFactory: RQBuilderCallback<PopulateModel, {}, RelationConfig>
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
    return this as unknown as RQBuilder<
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
            ? BuildRQCallback<RelationConfig>
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
   * new RQBuilder<TestModel>()
   *       .populateDynamic("nested", "component.1", () =>
   *         new RQBuilder<NestedModel>().eq("id", "value")
   *       )
   *       .populateDynamic("nested", "component.2", () =>
   *         new RQBuilder<NestedModel>().notEq("id", "value3")
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
    RelationConfig extends EntityBuilderConfig
  >(
    attribute: K,
    componentKey: C,
    builderFactory: RQBuilderCallback<PopulateModel, {}, RelationConfig>
  ) {
    const populateBuilder = builderFactory();
    const populate = this._query.population;

    const currentQuery = populate.get(attribute);
    const currentDynamic = currentQuery?.dynamicQuery || {};
    currentDynamic[componentKey] = {
      componentKey: componentKey,
      fields: populateBuilder.getRawFields(),
      sort: populateBuilder.getRawSort(),
      population: populateBuilder.getRawPopulation(),
      filters: populateBuilder.getRawFilters(),
    };

    populate.set(attribute, {
      key: attribute,
      dynamicQuery: currentDynamic,
    });

    return this as unknown as RQBuilder<
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
                    ? BuildRQCallback<RelationConfig>
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
  //</editor-fold>

  //<editor-fold desc="Pagination">
  /**
   * @description Pagination by page, when defining the page parameter
   * @param {number} page Select page
   * @param {boolean} withCount Toggles displaying the total number of entries to the response
   * @example
   * new RQBuilder<TestModel>().page(1)
   * // { page: 1; }
   */
  public page<Page extends number, WithCount extends boolean = true>(
    page: Page,
    withCount: WithCount = true as WithCount
  ) {
    if (!this._query.pagination) {
      this._query.pagination = {
        page: page,
        pageSize: undefined,
        paginationType: "page",
        withCount: withCount,
      };
    } else {
      this._query.pagination.page = page;
      this._query.pagination.paginationType = "page";
      this._query.pagination.withCount = withCount;
    }
    return this as unknown as RQBuilder<
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
        pagination: {
          page: Page;
          pageSize: Config["pagination"]["pageSize"];
          withCount: WithCount;
        };
        paginationType: "page";
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Pagination by page, when defining the pageSize parameter
   * @param pageSize
   * @example
   * new RQBuilder<TestModel>().pageSize(26)
   * // { pageSize: 26; }
   */
  public pageSize<PageSize extends number>(pageSize: PageSize) {
    if (!this._query.pagination) {
      this._query.pagination = {
        page: undefined,
        pageSize: pageSize,
        paginationType: "page",
      };
    } else {
      this._query.pagination.pageSize = pageSize;
      this._query.pagination.paginationType = "page";
    }

    return this as unknown as RQBuilder<
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
        pagination: {
          page: Config["pagination"]["page"];
          pageSize: PageSize;
          withCount: Config["pagination"]["withCount"];
        };
        paginationType: "page";
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Pagination by offset, when defining the start parameter
   * @param {number} start
   * @param {boolean} withCount Toggles displaying the total number of entries to the response
   * @example
   * new RQBuilder<TestModel>().start(5)
   * // { start: 5; }
   */
  public start<Start extends number, WithCount extends boolean = true>(
    start: Start,
    withCount: WithCount = true as WithCount
  ) {
    if (!this._query.pagination) {
      this._query.pagination = {
        page: start,
        pageSize: undefined,
        paginationType: "limit",
        withCount: withCount,
      };
    } else {
      this._query.pagination.page = start;
      this._query.pagination.paginationType = "limit";
      this._query.pagination.withCount = withCount;
    }
    return this as unknown as RQBuilder<
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
        pagination: {
          page: Start;
          pageSize: Config["pagination"]["pageSize"];
          withCount: WithCount;
        };
        paginationType: "limit";
        publicationState: Config["publicationState"];
        locale: Config["locale"];
        data: Config["data"];
      }
    >;
  }

  /**
   * @description Pagination by offset, when defining the limit parameter
   * @param {number} limit
   * @example
   * new RQBuilder<TestModel>().limit(20)
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
    return this as unknown as RQBuilder<
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
        pagination: {
          page: Config["pagination"]["page"];
          pageSize: Limit;
          withCount: Config["pagination"]["withCount"];
        };
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
   * new RQBuilder<TestModel, TestModel>().data({ id: 1 })
   * // { data: { id: 1 } }
   */
  public data<D extends Data>(data: D) {
    this._query.data = data;
    return this as unknown as RQBuilder<
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
   * @param {RQBuilder} builder Embedded builder
   */
  public joinFields<DeepConfig extends EntityBuilderConfig>(
    builder: RQBuilder<Model, {}, DeepConfig>
  ) {
    const currentFields = this._query.fields;
    const newFields = builder.getRawFields().values();

    for (const field of newFields) {
      currentFields.add(field);
    }

    return this as unknown as RQBuilder<
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
   * @param {RQBuilder} builder Embedded builder
   */
  public joinSort<DeepConfig extends EntityBuilderConfig>(
    builder: RQBuilder<Model, {}, DeepConfig>
  ) {
    const currentSorts = this._query.sort;
    const joinSortsValues = builder.getRawSort().values();

    for (let value of joinSortsValues) {
      currentSorts.set(value.key, value);
    }

    return this as unknown as RQBuilder<
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
   * @param {RQBuilder} builder Embedded builder
   * @param {boolean} joinRootLogical Override root logical ?
   * @param {boolean} joinRootNegate Override root negate ?
   */
  public joinFilters<
    DeepConfig extends EntityBuilderConfig,
    JoinRootLogical extends boolean = false,
    JoinRootNegate extends boolean = false
  >(
    builder: RQBuilder<Model, {}, DeepConfig>,
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

    return this as unknown as RQBuilder<
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
   * @param {RQBuilder} builder Embedded builder
   */
  public joinPopulate<DeepConfig extends EntityBuilderConfig>(
    builder: RQBuilder<Model, {}, DeepConfig>
  ) {
    const currentPopulate = this._query.population;
    const newPopulateValues = builder.getRawPopulation().values();

    for (const populate of newPopulateValues) {
      currentPopulate.set(
        populate.key,
        populate as unknown as StrapiPopulate<Model, any>
      );
    }

    return this as unknown as RQBuilder<
      Model,
      Data,
      {
        fields: Config["fields"];
        sort: Config["sort"];
        filters: Config["filters"];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: DeepConfig["populateAll"];
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
   * @param {RQBuilder} builder Embedded builder
   */
  public joinPagination<DeepConfig extends EntityBuilderConfig>(
    builder: RQBuilder<Model, {}, DeepConfig>
  ) {
    const externalPagination = builder.getRawPagination();

    if (_isDefined(externalPagination)) {
      this._query.pagination = externalPagination;
    }

    return this as unknown as RQBuilder<
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
   * @param {RQBuilder} builder Embedded builder
   */
  public joinQuery<DeepConfig extends EntityBuilderConfig>(
    builder: RQBuilder<Model, {}, DeepConfig>
  ) {
    this.joinPopulate(builder);
    this.joinFilters(builder);
    this.joinSort(builder);
    this.joinPagination(builder);
    this.joinFields(builder);

    return this as unknown as RQBuilder<
      Model,
      Data,
      {
        fields: [...Config["fields"], ...DeepConfig["fields"]];
        sort: [...Config["sort"], ...DeepConfig["sort"]];
        filters: [...Config["filters"], ...DeepConfig["filters"]];
        rootLogical: Config["rootLogical"];
        negate: Config["negate"];
        populateAll: DeepConfig["populateAll"];
        populates: {
          [P in
            | keyof Config["populates"]
            | keyof DeepConfig["populates"]]: P extends keyof DeepConfig["populates"]
            ? DeepConfig["populates"][P]
            : P extends keyof Config["populates"]
            ? Config["populates"][P]
            : never;
        };
        pagination: DeepConfig["pagination"];
        paginationType: DeepConfig["paginationType"];
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
   * new RQBuilder<TestModel>().locale("ua")
   * // { locale: "ua" }
   */
  public locale<L extends string>(code: L) {
    this._query.locale = code;
    return this as unknown as RQBuilder<
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
   * new RQBuilder<TestModel>().publicationState("live")
   * // { publicationState: "live" }
   */
  public publicationState<P extends PublicationStates>(state: P) {
    this._query.publicationState = state;
    return this as unknown as RQBuilder<
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
    return RQBuilder._buildQuery(this._query) as BuildRQOutput<Config>;
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

    const parsedSort = RQBuilder._parseSort(rawQuery.sort);
    if (parsedSort.length > 0) {
      builtQuery.sort = parsedSort;
    }

    const parsedFilters = RQBuilder._parseFilters(rawQuery.filters);
    if (_isDefined(parsedFilters)) {
      builtQuery.filters = parsedFilters;
    }

    const parsedPopulate = RQBuilder._parsePopulate(rawQuery.population);
    if (_isDefined(parsedPopulate)) {
      builtQuery.populate = parsedPopulate;
    }

    const parsedPagination = RQBuilder._parsePagination(rawQuery.pagination);
    if (_isDefined(parsedPagination)) {
      builtQuery.pagination = parsedPagination;
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
    const sortQuery: any[] = [];

    const sortValues = sorts.values();
    for (let sort of sortValues) {
      sortQuery.push(`${sort.key}:${sort.order}`);
    }

    return sortQuery;
  }

  private static _parsePagination(pagination?: StrapiUnionPagination) {
    if (!_isDefined(pagination)) return undefined;
    const paginationType = pagination.paginationType;

    const paginationQuery: any = {};

    if (_isDefined(pagination.page)) {
      const pageKey = paginationType === "page" ? "page" : "start";
      paginationQuery[pageKey] = pagination.page;
    }

    if (_isDefined(pagination.pageSize)) {
      const pageLimitKey = paginationType === "page" ? "pageSize" : "limit";
      paginationQuery[pageLimitKey] = pagination.pageSize;
    }

    paginationQuery.withCount = !!pagination.withCount;

    return paginationQuery;
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
        : { [filterKey]: parsedNestedFilters };
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
      const parsedAttribute = RQBuilder._parseAttributeFilter(
        attributeFilters[i]
      );
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
    if (_isDefined(allPopulate)) return "*";

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
            RQBuilder._buildQuery(dynamicComponent);
        }

        parsedPopulates[populateKey] = { on: parsedDynamicZone };
      } else if (nestedQuery) {
        parsedPopulates[populateKey] = RQBuilder._buildQuery(nestedQuery);
      } else {
        parsedPopulates[populateKey] = { populate: "*" };
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

// <editor-fold desc="Specific query types utils">
export type GetSortKeys<Keys extends readonly string[], V extends string> = {
  [K in keyof Keys]: `${Keys[K]}:${V}`;
};

type EntityBuilderConfig = {
  fields: unknown[];
  sort: unknown[];
  filters: unknown[];
  rootLogical: "$and" | "$or";
  negate: boolean;
  populateAll: boolean;
  populates: Record<string, any>;
  pagination: { page?: number; pageSize?: number; withCount?: boolean };
  paginationType: "page" | "limit";
  publicationState: PublicationStates;
  locale: string;
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
  pagination: { page: never; pageSize: never; withCount: never };
  paginationType: never;
  publicationState: never;
  locale: never;
  data: never;
};

type RQBuilderCallback<
  Model extends object,
  Data extends object,
  Config extends EntityBuilderConfig
> = () => RQBuilder<Model, Data, Config>;

type ParseRQBuilderPopulates<
  P extends Record<string, any>,
  PopulateAll extends boolean
> = PopulateAll extends true ? "*" : keyof P extends never ? never : P;

type BuildRQCallback<Config extends EntityBuilderConfig> = {
  fields: ParseList<Config["fields"]>;
  sort: ParseList<Config["sort"]>;
  filters: ParseFilters<
    Config["filters"],
    Config["rootLogical"],
    Config["negate"]
  >;
  populate: ParseRQBuilderPopulates<Config["populates"], Config["populateAll"]>;
} extends infer Result
  ? {
      [K in keyof Result as Result[K] extends never ? never : K]: Result[K];
    }
  : never;

type BuildRQOutput<Config extends EntityBuilderConfig> = {
  fields: ParseList<Config["fields"]>;
  sort: ParseList<Config["sort"]>;
  filters: ParseFilters<
    Config["filters"],
    Config["rootLogical"],
    Config["negate"]
  >;
  populate: ParseRQBuilderPopulates<Config["populates"], Config["populateAll"]>;
  pagination: Config["paginationType"] extends never
    ? never
    : {
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
        withCount: Config["pagination"]["withCount"] extends never
          ? never
          : Config["pagination"]["withCount"];
      } extends infer Result
    ? {
        [K in keyof Result as Result[K] extends never ? never : K]: Result[K];
      }
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
