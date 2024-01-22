import { _isDefined, _set, _unionBy } from "./query-utils";

export default class SQBuilder<Model extends object, Data extends object = {}> {
  private _query: QueryRawInfo<Model, Data> = {
    sort: new Map(),
    filters: {
      rootLogical: "$and",
      negate: false,
      attributeFilters: [],
    },
    population: [],
    fields: new Set(),
  };

  private readonly _builderConfig: Required<BuilderConfig> = {
    defaultSort: "asc",
  };

  private _prevFilterKey?: FilterKey<Model>;
  private _nextAttributeNegate: boolean = false;
  private _prevPopulateKey?: PopulateKey<any>;
  private _prevSortKey?: SortKey<Model>;
  private _isReadonly = false;

  constructor(builderConfig?: BuilderConfig) {
    if (builderConfig) {
      this._builderConfig = { ...this._builderConfig, ...builderConfig };
    }
  }

  //<editor-fold desc="Build functions">
  /**
   * @description Build Strapi query
   * @param {QueryTypes} queryType Default StrapiService
   * @return {StrapiBuiltQuery} Built query
   */
  public build(
    queryType: QueryTypes = "strapiService"
  ): StrapiBuiltQuery<Model, Data> {
    return SQBuilder._buildQuery(this._query, queryType);
  }

  /**
   * @description Build Strapi query for Strapi service
   * @return {StrapiBuiltQuery} Built query
   */
  public buildStrapiService(): StrapiBuiltQuery<Model, Data> {
    return SQBuilder._buildQuery(this._query, "strapiService");
  }

  /**
   * @description Build Strapi query for Entity service
   * @return {StrapiBuiltQuery} Built query
   */
  public buildEntityService(): StrapiBuiltQuery<Model, Data> {
    return SQBuilder._buildQuery(this._query, "entityService");
  }

  /**
   * @description Build Strapi query for Query engine
   * @return {StrapiBuiltQuery} Built query
   */
  public buildQueryEngine(): StrapiBuiltQuery<Model, Data> {
    return SQBuilder._buildQuery(this._query, "queryEngine");
  }
  //</editor-fold>

  //<editor-fold desc="Filters functions">
  /**
   * @description Start filter query
   * @param {FilterKey} attribute This model attribute key
   * @param {FilterCallback} thisCallback Provides same builder to group filters chains
   * @return {SQBuilder} This builder
   */
  public filters(
    attribute: FilterKey<Model>,
    thisCallback?: FilterCallback<Model, any>
  ): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    this._prevFilterKey = attribute;

    if (thisCallback !== undefined) {
      thisCallback(this);
    }

    return this;
  }

  /**
   * @description Add deep nested filters to current Model
   * @param {FilterCallback} nestedCallback
   * @return {SQBuilder} This builder
   */
  public filterThis(
    nestedCallback: FilterCallback<Model, Data>
  ): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const nestedBuilder = new SQBuilder<Model, Data>();
    nestedCallback(nestedBuilder);

    this._addToFilter(
      {
        nested:
          nestedBuilder.getRawFilters() as unknown as StrapiRawFilters<{}>,
      },
      () => {}
    );

    return this;
  }

  /**
   * @description Add deep nested filters to next Model
   * @param {FilterKey} attribute
   * @param {FilterCallback} nestedCallback
   * @return {SQBuilder} This builder
   */
  public filterDeep<NestedModel extends object = {}>(
    attribute: FilterKey<Model>,
    nestedCallback: FilterCallback<NestedModel, any>
  ): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const nestedBuilder = new SQBuilder<NestedModel, any>();
    nestedCallback(nestedBuilder);

    this._addToFilter(
      {
        key: attribute,
        nested:
          nestedBuilder.getRawFilters() as unknown as StrapiRawFilters<{}>,
      },
      () => {
        this._prevFilterKey = undefined;
      }
    );

    return this;
  }

  //<editor-fold desc="Logical filters">
  /**
   * @description Negates current attribute or logical filter
   * @return {SQBuilder} This builder
   */
  public not(): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const target =
      this._prevFilterKey !== undefined ? "attribute" : "negateRoot";

    target === "negateRoot"
      ? (this._query.filters.negate = true)
      : (this._nextAttributeNegate = true);

    return this;
  }

  /**
   * @description Add root logical OR filter.
   * @return {SQBuilder} This builder
   */
  public or(): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    this._query.filters.rootLogical = "$or";
    return this;
  }

  /**
   * @description Add root logical AND filter.
   * @return {SQBuilder} This builder
   */
  public and(): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    this._query.filters.rootLogical = "$and";
    return this;
  }
  //</editor-fold>

  //<editor-fold desc="Attributes filters">
  /**
   * @description Add "Equal" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public eq(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$eq", value);
  }

  /**
   * @description Add "Equal insensitive" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public eqi(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$eqi", value);
  }

  /**
   * @description Add "Not Equal" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public ne(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$ne", value);
  }

  /**
   * @description Add "In" attribute filter
   * @param {MultipleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public in(value: MultipleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$in", value);
  }

  /**
   * @description Add "Not In" attribute filter
   * @param {MultipleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public notIn(value: MultipleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$notIn", value);
  }

  /**
   * @description Add "Less Than" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public lt(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$lt", value);
  }

  /**
   * @description Add "Less Than or Equal" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public lte(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$lte", value);
  }

  /**
   * @description Add "Greater Than" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public gt(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$gt", value);
  }

  /**
   * @description Add "Greater Than or Equal" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public gte(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$gte", value);
  }

  /**
   * @description Add "Contains" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public contains(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$contains", value);
  }

  /**
   * @description Add "Not Contains" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public notContains(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$notContains", value);
  }

  /**
   * @description Add "Contains case-insensitive" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public containsi(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$containsi", value);
  }

  /**
   * @description Add "Not Contains case-insensitive" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public notContainsi(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$notContainsi", value);
  }

  /**
   * @description Add "Start with" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public startsWith(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$startsWith", value);
  }

  /**
   * @description Add "Ends with" attribute filter
   * @param {SingleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public endsWith(value: SingleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$endsWith", value);
  }

  /**
   * @description Add "Is null" attribute filter
   * @param {boolean} value
   * @return {SQBuilder} This builder
   */
  public null(value: boolean): SQBuilder<Model, Data> {
    return this._addAttribute("$null", value);
  }

  /**
   * @description Add "Is not null" attribute filter
   * @param {boolean} value
   * @return {SQBuilder} This builder
   */
  public notNull(value: boolean): SQBuilder<Model, Data> {
    return this._addAttribute("$notNull", value);
  }

  /**
   * @description Add "Between" attribute filter
   * @param {MultipleAttributeType} value
   * @return {SQBuilder} This builder
   */
  public between(value: MultipleAttributeType): SQBuilder<Model, Data> {
    return this._addAttribute("$between", value);
  }
  //</editor-fold>

  private _addAttribute(
    type: FilterAttributeType,
    value: AttributeValues
  ): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    if (this._prevFilterKey === undefined) {
      return this;
    }

    this._addToFilter(
      {
        key: this._prevFilterKey,
        type: type,
        value,
        negate: this._nextAttributeNegate,
      },
      () => {
        this._prevFilterKey = undefined;
        this._nextAttributeNegate = false;
      }
    );

    return this;
  }

  private _addToFilter(
    filter: StrapiAttributesFilter<Model>,
    onAdded: () => void
  ) {
    this._query.filters.attributeFilters.push(filter);
    onAdded();
  }
  //</editor-fold>

  //<editor-fold desc="Population">
  /**
   * @description Add query populate
   * @description Can be as a simple key or take a callback for nested query
   * @param {StrapiPopulateInputQuery} populateQuery
   * @param {PopulateCallback} nestedCallback Provides callback with new builder for nested filtering, sorting and fields selection
   * @return {SQBuilder} This builder
   */
  public populate<PopulateModel extends object>(
    populateQuery: StrapiPopulateInputQuery<Model>,
    nestedCallback?: PopulateCallback<PopulateModel>
  ): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    let nestedBuilder: SQBuilder<PopulateModel, any> | undefined = undefined;

    const parsedPopulateQuery = SQBuilder._parsePopulation<
      Model,
      PopulateModel
    >(populateQuery);

    const singlePopulateQuery = parsedPopulateQuery[0];

    if (nestedCallback !== undefined && typeof nestedCallback === "function") {
      nestedBuilder = new SQBuilder<PopulateModel, any>({
        defaultSort: this._builderConfig.defaultSort,
      });
      nestedBuilder.setPrevPopulationKey(singlePopulateQuery.key);
      nestedCallback(nestedBuilder);
    }

    if (nestedBuilder) {
      const findMorph = nestedBuilder.getPopulationByKey<PopulateModel>(
        singlePopulateQuery.key as PopulateKey<PopulateModel>
      );

      const isMorphData =
        findMorph !== undefined &&
        !!findMorph.nestedQuery &&
        !SQBuilder._isDefaultQueryPopulation(findMorph.nestedQuery);

      parsedPopulateQuery[0] = {
        key: singlePopulateQuery.key,
        nestedQuery: isMorphData
          ? findMorph.nestedQuery
          : {
              fields: nestedBuilder.getRawFields(),
              population: nestedBuilder.getRawPopulation(),
              sort: nestedBuilder.getRawSort(),
              filters: nestedBuilder.getRawFilters(),
            },
      };
    }

    for (const population of parsedPopulateQuery) {
      this._addToPopulate(population);
    }

    return this;
  }

  /**
   * @description Add populate fragments for dynamic zones
   * @param {string} componentTypeKey Component type key
   * @param {PopulateCallback} nestedCallback Dynamic component builder
   * @return {SQBuilder} This builder
   */
  public on<PopulateModel extends object>(
    componentTypeKey: string,
    nestedCallback: PopulateCallback<PopulateModel>
  ): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    if (this._prevPopulateKey === undefined) {
      return this;
    }

    const populationIndex = this._query.population.findIndex(
      (p) => p.key === this._prevPopulateKey
    );

    const nestedBuilder: SQBuilder<PopulateModel, any> = new SQBuilder<
      PopulateModel,
      any
    >({
      defaultSort: this._builderConfig.defaultSort,
    });

    nestedCallback(nestedBuilder);

    const newQuery: MorphOnPopulate<PopulateModel> = {};
    Object.assign(newQuery, {
      [componentTypeKey]: {
        fields: nestedBuilder.getRawFields(),
        population: nestedBuilder.getRawPopulation(),
        sort: nestedBuilder.getRawSort(),
        filters: nestedBuilder.getRawFilters(),
      },
    });

    if (populationIndex === -1) {
      this._query.population.push({
        key: this._prevPopulateKey as PopulateKey<Model>,
        nestedQuery: newQuery,
      });
    } else {
      const populationQuery = this._query.population[populationIndex];

      this._query.population[populationIndex] = {
        key: this._prevPopulateKey as PopulateKey<Model>,
        nestedQuery: { ...populationQuery.nestedQuery, ...newQuery },
      };
    }

    return this;
  }

  private _addToPopulate<PopulateModel extends object>(
    populate: StrapiPopulate<Model, PopulateModel>
  ) {
    if (populate.key === "*") {
      this._query.population = [{ key: populate.key }];
      return;
    }

    const founded = this._query.population.findIndex((f) => {
      return f.key === populate.key;
    });

    if (founded === -1) {
      this._query.population.push(populate);
    } else {
      this._query.population[founded] = populate;
    }
  }

  private static _parsePopulation<
    ParentModel extends object,
    PopulateModel extends object
  >(
    populationQuery: StrapiPopulateInputQuery<ParentModel>
  ): StrapiPopulate<ParentModel, PopulateModel>[] {
    if (populationQuery === "*") {
      return [{ key: "*" }];
    }

    if (this._isArrayOfPopKeys(populationQuery)) {
      return populationQuery.map(
        (s) => ({ key: s } as StrapiPopulate<ParentModel, PopulateModel>)
      );
    }

    if (this._isNotArrayOfPopKeys(populationQuery)) {
      return [{ key: populationQuery }];
    }

    return [];
  }

  private static _isNotArrayOfPopKeys<ParentModel extends object>(
    query: StrapiPopulateInputQuery<ParentModel>
  ): query is PopulateKey<ParentModel> {
    return !Array.isArray(query);
  }

  private static _isArrayOfPopKeys<ParentModel extends object>(
    query:
      | GetRelations<ParentModel>
      | GetRelations<ParentModel>[]
      | string
      | string[]
  ): query is PopulateKey<ParentModel>[] {
    return Array.isArray(query);
  }

  private static _isDefaultQueryPopulation<PopulateModel extends object>(
    query: PopulateNestedQuery<PopulateModel>
  ): query is DefaultPopulate<PopulateModel> {
    return (
      "sort" in query ||
      "filters" in query ||
      "population" in query ||
      "fields" in query
    );
  }
  //</editor-fold>

  //<editor-fold desc="Fields">
  /**
   * @description Select specific fields
   * @summary Same keys will be merged
   * @param {StrapiSingleFieldInput[]} fields
   * @return {SQBuilder} This builder
   */
  public fields(
    fields: StrapiSingleFieldInput<Model>[]
  ): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    if (fields.length > 0) {
      fields.forEach((f) => this._query.fields.add(f));
    }
    return this;
  }

  /**
   * @description Select specific field
   * @summary Same keys will be merged
   * @param {StrapiSingleFieldInput} field
   * @return {SQBuilder} This builder
   */
  public field(field: StrapiSingleFieldInput<Model>): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    this._query.fields.add(field);
    return this;
  }
  //</editor-fold>

  //<editor-fold desc="Sort">
  /**
   * @description Add sort key
   * @summary Same keys will be merged
   * @summary With next chain call .asc() .desc()
   * @param {SortKey} sortKey
   * @return {SQBuilder} This builder
   */
  public sort(sortKey: SortKey<Model>): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    this._query.sort.set(sortKey, {
      key: sortKey,
      type: this._builderConfig.defaultSort,
    });

    this._prevSortKey = sortKey;

    return this;
  }

  /**
   * @description Add sort keys list
   * @summary Same keys will be merged
   * @param {SortKey[]} sortKeys
   * @return {SQBuilder} This builder
   */
  public sorts(sortKeys: SortKey<Model>[]): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    if (sortKeys.length > 0) {
      sortKeys.forEach((key) => {
        this._query.sort.set(key, {
          key: key,
          type: this._builderConfig.defaultSort,
        });
      });
    }

    this._prevSortKey = undefined;

    return this;
  }

  /**
   * @description Add sort as object description
   * @summary Same keys will be merged
   * @summary With next chain call .asc() .desc()
   * @param {StrapiSort} sort
   * @return {SQBuilder} This builder
   */
  public sortRaw(sort: StrapiSort<Model>): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const sortKey = sort.key;

    this._query.sort.set(sortKey, sort);
    this._prevSortKey = sortKey;

    return this;
  }

  /**
   * @description Add sorts as object description list
   * @summary Same keys will be merged
   * @param {StrapiSort[]} sorts
   * @return {SQBuilder} This builder
   */
  public sortsRaw(sorts: StrapiSort<Model>[]): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    if (sorts.length > 0) {
      sorts.forEach((sort) => {
        this._query.sort.set(sort.key, sort);
      });
    }

    this._prevSortKey = undefined;

    return this;
  }

  /**
   * @description Add sort ascending direction to last sort element or all sort chain
   * @summary Param changeAll changes all sorts to specified direction
   * @param {boolean} changeAll
   * @return {SQBuilder} This builder
   */
  public asc(changeAll: boolean = false): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    this._changeSortDirection(changeAll, "asc");

    return this;
  }

  /**
   * @description Add sort descending direction to last sort element or all sort chain
   * @summary Param changeAll changes all sorts to specified direction
   * @param {boolean} changeAll
   * @return {SQBuilder} This builder
   */
  public desc(changeAll: boolean = false): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    this._changeSortDirection(changeAll, "desc");

    return this;
  }

  private _changeSortDirection(
    changeAll = false,
    direction: StrapiSortOptions
  ) {
    if (!changeAll) {
      const previousSortKey = this._prevSortKey;
      if (!previousSortKey) {
        return;
      }

      this._query.sort.set(previousSortKey, {
        key: previousSortKey,
        type: direction,
      });
      this._prevSortKey = undefined;

      return;
    } else {
      this._query.sort.forEach((sort) => {
        const sortKey = sort.key;
        this._query.sort.set(sortKey, { key: sortKey, type: direction });
      });
    }
  }
  //</editor-fold>

  // <editor-fold desc="Pagination">
  /**
   * @description Add page
   * @param {number} page
   * @param {boolean} withCount
   * @return {SQBuilder} This builder
   */
  public page(
    page: number,
    withCount: boolean = false
  ): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const current = this._query.pagination;
    this._query.pagination = current
      ? { ...current, page, withCount }
      : { page, withCount };

    return this;
  }

  /**
   * @description Add page size
   * @param {number} pageSize
   * @return {SQBuilder} This builder
   */
  public pageSize(pageSize: number): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const current = this._query.pagination;
    this._query.pagination = current ? { ...current, pageSize } : { pageSize };

    return this;
  }

  /**
   * @description Add offset pagination start
   * @param {number} start
   * @param {boolean} withCount
   * @return {SQBuilder} This builder
   */
  public pageStart(
    start: number,
    withCount: boolean = false
  ): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const current = this._query.offsetPagination;
    this._query.offsetPagination = current
      ? {
          ...current,
          start,
          withCount,
        }
      : { start, withCount };

    return this;
  }

  /**
   * @description Add offset pagination limit
   * @param {number} limit
   * @return {SQBuilder} This builder
   */
  public pageLimit(limit: number): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const current = this._query.offsetPagination;
    this._query.offsetPagination = current
      ? {
          ...current,
          limit,
        }
      : { limit };

    return this;
  }
  // </editor-fold>

  // <editor-fold desc="Data">
  /**
   * @description Add Any input data to query
   * @param {object} dataObject
   * @return {SQBuilder} This builder
   */
  public data(dataObject: Data): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    this._query.data = dataObject;
    return this;
  }
  // </editor-fold>

  // <editor-fold desc="Protected utils">
  protected getRawFilters(): StrapiRawFilters<Model> {
    return this._query.filters;
  }
  protected getRawFields(): StrapiFields<Model> {
    return new Set([...this._query.fields]);
  }
  protected getRawSort(): StrapiSorts<Model> {
    return new Map([...this._query.sort]);
  }
  protected getRawPopulation(): StrapiPopulate<Model, any>[] {
    return this._query.population;
  }
  protected getRawPagination(): {
    pagination?: StrapiPagination;
    offsetPagination?: StrapiOffsetPagination;
  } {
    return {
      pagination: this._query.pagination,
      offsetPagination: this._query.offsetPagination,
    };
  }

  protected setPrevPopulationKey<PopulationModel extends object>(
    populationKey: PopulateKey<PopulationModel>
  ): void {
    this._prevPopulateKey = populationKey;
  }
  protected getPopulationByKey<PopulationModel extends object>(
    populationKey: PopulateKey<Model>
  ): StrapiPopulate<Model, PopulationModel> | undefined {
    return this._query.population.find((p) => p.key === populationKey);
  }
  // </editor-fold>

  //<editor-fold desc="Public functions">
  /**
   * @description Make the builder read-only that all filter methods don't change query state
   * @param {PublicationStates} state
   * @return {SQBuilder} This builder
   */
  public publicationState(state: PublicationStates): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    this._query.publicationState = state;
    return this;
  }

  /**
   * @description Make the builder read-only that all filter methods don't change query state
   * @param {string} code
   * @return {SQBuilder} This builder
   */
  public locale(code: string): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    this._query.locale = code;
    return this;
  }

  /**
   * @description Make the builder read-only that all filter methods don't change query state
   * @param {boolean} isReadonly
   * @return {SQBuilder} This builder
   */
  public readonly(isReadonly?: boolean): SQBuilder<Model, Data> {
    this._isReadonly = isReadonly === undefined ? true : isReadonly;
    return this;
  }

  /**
   * @description Join external builder pagination
   * @param {SQBuilder} builder External builder
   * @return {SQBuilder} This builder
   */
  public joinPagination<T extends object, F extends object>(
    builder: SQBuilder<T, F>
  ): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const externalPagination = builder.getRawPagination();

    if (_isDefined(externalPagination?.pagination)) {
      const current = this._query.pagination;

      this._query.pagination = current
        ? {
            ...current,
            ...externalPagination.pagination,
          }
        : { ...externalPagination.pagination };
    }

    if (_isDefined(externalPagination?.offsetPagination)) {
      const current = this._query.offsetPagination;

      this._query.offsetPagination = current
        ? {
            ...current,
            ...externalPagination.offsetPagination,
          }
        : { ...externalPagination.offsetPagination };
    }

    return this;
  }

  /**
   * @description Join external builder population
   * @param {SQBuilder} builder External builder
   * @return {SQBuilder} This builder
   */
  public joinPopulation<T extends object, F extends object>(
    builder: SQBuilder<T, F>
  ): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const externalPopulation =
      builder.getRawPopulation() as unknown as StrapiPopulate<Model, any>[];

    this._query.population = _unionBy(
      (p) => p.key,
      this._query.population,
      externalPopulation
    );

    return this;
  }

  /**
   * @description Join external builder filters
   * @param {SQBuilder} builder External builder
   * @param {boolean} mergeRootLogical If true, the main logic filter will be overwritten by the input
   * @return {SQBuilder} This builder
   */
  public joinFilters<T extends object, F extends object>(
    builder: SQBuilder<T, F>,
    mergeRootLogical: boolean = false
  ): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const externalFilters = builder.getRawFilters();

    this._query.filters.attributeFilters =
      this._query.filters.attributeFilters.concat(
        externalFilters.attributeFilters as unknown as StrapiAttributesFilter<Model>[]
      );

    this._query.filters.negate = externalFilters.negate;

    if (mergeRootLogical) {
      this._query.filters.rootLogical = externalFilters.rootLogical;
    }

    return this;
  }

  /**
   * @description Join external builder sorts
   * @param {SQBuilder} builder External builder
   * @return {SQBuilder} This builder
   */
  public joinSort(builder: SQBuilder<Model, Data>): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const externalSort = builder.getRawSort();
    if (externalSort.size > 0) {
      externalSort.forEach((value, key) => {
        this._query.sort.set(key, value);
      });
    }

    return this;
  }

  /**
   * @description Join external builder fields
   * @param {SQBuilder} builder External builder
   * @return {SQBuilder} This builder
   */
  public joinFields(builder: SQBuilder<Model, Data>): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    const externalFields = builder.getRawFields();
    if (externalFields.size > 0) {
      externalFields.forEach((f) => {
        this._query.fields.add(f);
      });
    }

    return this;
  }

  /**
   * @description Join all state
   * @param {SQBuilder} builder External builder
   * @return {SQBuilder} This builder
   */
  public joinAll(builder: SQBuilder<Model, Data>): SQBuilder<Model, Data> {
    if (this._isReadonly) {
      return this;
    }

    this.joinPagination(builder);
    this.joinPopulation(builder);
    this.joinFilters(builder);
    this.joinSort(builder);
    this.joinFields(builder);

    return this;
  }
  //</editor-fold>

  // <editor-fold desc="Query parsing utils">
  private static _buildQuery<Md extends object, Dt extends object>(
    rawQuery: QueryRawInfo<Md, Dt>,
    queryType: QueryTypes = "strapiService"
  ): StrapiBuiltQuery<Md, Dt> {
    const isQueryEngine = queryType === "queryEngine";
    let parsedQuery: StrapiBuiltQuery<Md, Dt> = {};

    const pagination = this._parsePagination(
      queryType,
      rawQuery.pagination,
      rawQuery.offsetPagination
    );

    if (_isDefined(pagination)) {
      if (queryType === "strapiService") {
        parsedQuery.pagination = pagination;
      } else {
        parsedQuery = { ...parsedQuery, ...pagination };
      }
    }

    if (rawQuery.sort.size > 0) {
      parsedQuery[isQueryEngine ? "orderBy" : "sort"] =
        SQBuilder._parseSort<Md>(rawQuery.sort);
    }

    if (rawQuery.fields.size > 0) {
      parsedQuery[isQueryEngine ? "select" : "fields"] = [...rawQuery.fields];
    }

    const filters = SQBuilder._parseFilters<Md>(rawQuery.filters);
    if (_isDefined(filters)) {
      parsedQuery[isQueryEngine ? "where" : "filters"] = filters;
    }

    // Populate calls build for nested query
    const populate = SQBuilder._parsePopulate(rawQuery.population, queryType);
    if (_isDefined(populate)) {
      parsedQuery.populate = populate;
    }

    if (_isDefined(rawQuery.data)) {
      parsedQuery.data = rawQuery.data;
    }

    if (_isDefined(rawQuery.publicationState) && !isQueryEngine) {
      parsedQuery.publicationState = rawQuery.publicationState;
    }

    if (_isDefined(rawQuery.locale) && queryType === "strapiService") {
      parsedQuery.locale = rawQuery.locale;
    }

    return parsedQuery;
  }

  private static _parsePagination(
    queryType: QueryTypes,
    pagination?: StrapiPagination,
    offsetPagination?: StrapiOffsetPagination
  ): UnionPagination | undefined {
    if (_isDefined(offsetPagination)) {
      if (queryType === "entityService" || queryType === "queryEngine") {
        const { withCount, ...other } = offsetPagination;
        return other;
      }

      return offsetPagination;
    }

    if (_isDefined(pagination) && queryType !== "queryEngine") {
      if (queryType === "entityService") {
        const { withCount, ...other } = pagination;
        return other;
      }

      return pagination;
    }
  }

  private static _parseSort<Md extends object>(sorts?: StrapiSorts<Md>) {
    if (!sorts) {
      return [];
    }
    if (sorts.size === 0) {
      return [];
    }

    const sortQuery: any[] = new Array(sorts.size);

    let index = 0;
    sorts.forEach((sort) => {
      sortQuery[index] = _set({}, sort.key, sort.type);
      index++;
    });

    return sortQuery;
  }

  private static _parseAttributeFilter<Md extends object>(
    filter: StrapiAttributesFilter<Md>
  ): StrapiFiltersType<Md> | undefined {
    if (filter.nested !== undefined) {
      const nestedFilters = this._parseFilters(filter.nested);
      if (!_isDefined(nestedFilters)) {
        return undefined;
      }

      return (
        !_isDefined(filter.key)
          ? nestedFilters
          : _set({}, filter.key, nestedFilters)
      ) as StrapiFiltersType<Md>;
    }

    if (
      !_isDefined(filter.value) ||
      !_isDefined(filter.type) ||
      !_isDefined(filter.key)
    ) {
      return undefined;
    }

    return filter.negate
      ? (_set({}, filter.key, {
          ["$not"]: {
            [filter.type]: filter.value,
          },
        }) as StrapiFiltersType<Md>)
      : (_set({}, filter.key, {
          [filter.type]: filter.value,
        }) as StrapiFiltersType<Md>);
  }

  private static _parseFilters<Md extends object>(
    rawFilters?: StrapiRawFilters<Md>
  ): StrapiFiltersType<Md> | undefined {
    const attributeFilters = rawFilters?.attributeFilters || [];
    const rootLogical = rawFilters?.rootLogical || "$and";
    const negateRoot = rawFilters?.negate || false;

    const parsedFilters: StrapiFiltersType<Md>[] = [];

    attributeFilters.forEach((attributeQuery) => {
      const parsedAttribute = SQBuilder._parseAttributeFilter(attributeQuery);
      if (!_isDefined(parsedAttribute)) {
        return;
      }

      parsedFilters.push(parsedAttribute);
    });

    const totalParsedFilters = parsedFilters.length;
    if (totalParsedFilters === 0) {
      return undefined;
    }

    const filters = {
      [rootLogical]: parsedFilters,
    };

    return negateRoot
      ? ({ ["$not"]: filters } as StrapiFiltersType<Md>)
      : (filters as StrapiFiltersType<Md>);
  }

  private static _parsePopulate<Md extends object, Dt extends object>(
    populates?: StrapiPopulate<Md, Dt>[],
    queryType: QueryTypes = "strapiService"
  ): any | undefined {
    if (!populates?.some((f) => !!f)) {
      return undefined;
    }

    const isQueryEngine = queryType === "queryEngine";

    let parsedPopulates: any = {};

    for (const populate of populates) {
      if (populate.key === "*") {
        parsedPopulates = isQueryEngine ? true : "*";
        break;
      }

      const isComplex = SQBuilder._isPopulateComplex(populate);

      if (isComplex) {
        const nestedQuery = populate.nestedQuery as PopulateNestedQuery<Dt>;

        const isDefaultQuery = this._isDefaultQueryPopulation(nestedQuery);

        if (isDefaultQuery) {
          Object.assign(parsedPopulates, {
            [populate.key]: SQBuilder._buildQuery(nestedQuery, queryType),
          });
        } else {
          const morphQuery = {};
          Object.entries(nestedQuery).forEach(([key, query]) => {
            const parsedQuery = SQBuilder._buildQuery(query, queryType);

            if (Object.keys(parsedQuery).length > 0) {
              Object.assign(morphQuery, {
                [key]: parsedQuery,
              });
            }
          });
          Object.assign(parsedPopulates, {
            [populate.key]: { on: morphQuery },
          });
        }
      } else {
        Object.assign(parsedPopulates, { [populate.key]: true });
      }
    }

    return parsedPopulates;
  }

  private static _isPopulateComplex<Md extends object, Dt extends object>(
    populate: StrapiPopulate<Md, Dt>
  ) {
    return populate.nestedQuery !== undefined && populate.nestedQuery !== null;
  }
  // </editor-fold>
}

// <editor-fold desc="Base types">
type QueryTypes = "strapiService" | "entityService" | "queryEngine";
type PublicationStates = "live" | "preview";
type StrapiSortOptions = "desc" | "asc";
type FilterLogicalType = "$and" | "$or" | "$not";
type FilterAttributeType =
  | "$eq"
  | "$eqi"
  | "$ne"
  | "$in"
  | "$notIn"
  | "$lt"
  | "$lte"
  | "$gt"
  | "$gte"
  | "$between"
  | "$contains"
  | "$notContains"
  | "$containsi"
  | "$notContainsi"
  | "$startsWith"
  | "$endsWith"
  | "$null"
  | "$notNull";
//</editor-fold>

// <editor-fold desc="Sort types">
type SortKey<Model extends object> = GetStrictOrWeak<
  Model,
  FieldPath<Model>,
  FieldPath<Model> | string
>;

interface StrapiSort<Model extends object> {
  key: SortKey<Model>;
  type: StrapiSortOptions;
}

type StrapiSorts<Model extends object> = Map<SortKey<Model>, StrapiSort<Model>>;
// </editor-fold>

// <editor-fold desc="Pagination Types">
interface StrapiPagination {
  page?: number;
  pageSize?: number;
  withCount?: boolean;
}

interface StrapiOffsetPagination {
  start?: number;
  limit?: number;
  withCount?: boolean;
}

type UnionPagination = StrapiPagination | StrapiOffsetPagination;
// </editor-fold>

// <editor-fold desc="Filter types">
type SingleAttributeType = string | number | boolean;
type MultipleAttributeType = string[] | number[];

type FilterCallback<Model extends object, Data extends object> = (
  builder: SQBuilder<Model, Data>
) => void;

type FilterKey<Model extends object> = GetStrictOrWeak<
  Model,
  FieldPath<Model>,
  FieldPath<Model> | string
>;

type AttributeValues = string | string[] | number | number[] | boolean;

interface StrapiAttributesFilter<
  Model extends object,
  NestedModel extends object = {}
> {
  key?: FilterKey<Model>;
  type?: FilterAttributeType;
  value?: AttributeValues;
  negate?: boolean;
  nested?: StrapiRawFilters<NestedModel>;
}

interface StrapiRawFilters<Model extends object> {
  rootLogical: FilterLogicalType;
  negate: boolean;
  attributeFilters: StrapiAttributesFilter<Model>[];
}
// </editor-fold>

// <editor-fold desc="Population Types">
type StrapiPopulateInputQuery<Model extends object> =
  | GetStrictOrWeak<
      Model,
      GetRelations<Model> | GetRelations<Model>[],
      GetRelations<Model> | GetRelations<Model>[] | string | string[]
    >
  | "*";

type PopulateKey<Model extends object> =
  | GetStrictOrWeak<Model, GetRelations<Model>, GetRelations<Model> | string>
  | "*";

type MorphOnPopulate<PopulateModel extends object> = {
  [key: string]: Omit<QueryRawInfo<PopulateModel, object>, "pagination">;
};

type DefaultPopulate<PopulateModel extends object> = Omit<
  QueryRawInfo<PopulateModel, object>,
  "pagination"
>;

type PopulateNestedQuery<PopulateModel extends object> =
  | DefaultPopulate<PopulateModel>
  | MorphOnPopulate<PopulateModel>;

interface StrapiPopulate<
  ParentModel extends object,
  PopulateModel extends object
> {
  key: PopulateKey<ParentModel>;
  nestedQuery?: PopulateNestedQuery<PopulateModel>;
}

type PopulateCallback<PopulationModel extends object> = (
  builder: SQBuilder<PopulationModel, any>
) => void;
// </editor-fold>

// <editor-fold desc="Field types">
type StrapiSingleFieldInput<Model extends object> = GetStrictOrWeak<
  Model,
  GetAttributes<Model>,
  GetAttributes<Model> | string
>;

type StrapiFields<Model extends object> = Set<StrapiSingleFieldInput<Model>>;
// </editor-fold>

// <editor-fold desc="Query shapes">
interface BuilderConfig {
  defaultSort?: StrapiSortOptions;
}

interface QueryRawInfo<Model extends object, Data extends object> {
  sort: StrapiSorts<Model>;
  filters: StrapiRawFilters<Model>;
  pagination?: StrapiPagination;
  offsetPagination?: StrapiOffsetPagination;
  population: StrapiPopulate<Model, any>[];
  fields: StrapiFields<Model>;
  data?: Data;
  publicationState?: PublicationStates;
  locale?: string;
}

type StrapiFiltersType<Model extends object> = {
  [key in
    | FilterLogicalType
    | FilterAttributeType
    | FieldPath<Model>
    | GetAttributes<Model>
    | GetRelations<Model>]:
    | number
    | string
    | number[]
    | string[]
    | StrapiFiltersType<Model>
    | StrapiFiltersType<Model>[];
};

interface StrapiBuiltQuery<Model extends object, Data extends object> {
  filters?: StrapiFiltersType<Model>;
  fields?: StrapiSingleFieldInput<Model>[];
  data?: Data;
  pagination?: UnionPagination;
  population?: any;
  publicationState?: PublicationStates;
  locale?: string;
  where?: StrapiFiltersType<Model>;
  [key: string]: any;
}
// </editor-fold>

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
