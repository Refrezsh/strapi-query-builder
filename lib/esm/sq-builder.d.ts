import { BuilderConfig, FilterInputCallback, FilterKey, MultipleAttributeType, PopulationInputCallback, PopulationKey, QueryRawInfo, QueryTypes, SingleAttributeType, StrapiEntityQuery, StrapiFields, StrapiFieldsInputQuery, StrapiOffsetPagination, StrapiPagination, StrapiPopulation, StrapiPopulationInputQuery, StrapiRawFilters, StrapiSort, StrapiSortInputQuery } from "./sq-builder-types";
export declare class SQBuilder<Model extends object, Data extends object = {}> {
    private _query;
    private readonly _builderConfig;
    private _prevFilterKey?;
    private _nextAttributeNegate;
    private _prevPopulateKey?;
    private _isReadonly;
    constructor(builderConfig?: BuilderConfig);
    /**
     * @description Build Strapi query
     * @param {QueryTypes} queryType Default StrapiService
     * @return {StrapiEntityQuery} Composed query
     */
    build(queryType?: QueryTypes): StrapiEntityQuery<Model, Data>;
    /**
     * @description Build Strapi query for Strapi service
     * @return {StrapiEntityQuery} Composed query
     */
    buildStrapiService(): StrapiEntityQuery<Model, Data>;
    /**
     * @description Build Strapi query for Entity service
     * @return {StrapiEntityQuery} Composed query
     */
    buildEntityService(): StrapiEntityQuery<Model, Data>;
    /**
     * @description Build Strapi query for Query service
     * @return {StrapiEntityQuery} Composed query
     */
    buildQueryEngine(): StrapiEntityQuery<Model, Data>;
    /**
     * @description Filter query
     * @description If filterInput is empty or callback builder wait for logical filtration if key input builder wait for attribute filters
     * @param {FilterInputCallback| FilterKey} filterInput Can be key or callback with same builder for visual filter grouping
     * @param {FilterInputCallback} thisCallback Provides same builder to group filters function calls
     * @return {SQBuilder} This builder
     */
    filters(filterInput?: FilterInputCallback<Model, Data> | FilterKey<Model>, thisCallback?: FilterInputCallback<Model, any>): SQBuilder<Model, Data>;
    /**
     * Add deep nested filters to current filter - this function provide new builder to callback
     * @param nestedCallback
     */
    with<NestedModel extends object = {}>(nestedCallback: FilterInputCallback<NestedModel, any>): SQBuilder<Model, Data>;
    /**
     * @description Negates current attribute or logical filter
     * @return {SQBuilder} This builder
     */
    not(): SQBuilder<Model, Data>;
    /**
     * @description Add logical OR filter.
     * @return {SQBuilder} This builder
     */
    or(): SQBuilder<Model, Data>;
    /**
     * @description Add logical AND filter.
     * @return {SQBuilder} This builder
     */
    and(): SQBuilder<Model, Data>;
    /**
     * @description Add "Equal" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    eq(value: SingleAttributeType): SQBuilder<Model, Data>;
    /**
     * @description Add "Equal insensitive" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    eqi(value: SingleAttributeType): SQBuilder<Model, Data>;
    /**
     * @description Add "Not Equal" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    ne(value: SingleAttributeType): SQBuilder<Model, Data>;
    /**
     * @description Add "In" attribute filter
     * @param {MultipleAttributeType} value
     * @return {SQBuilder} This builder
     */
    in(value: MultipleAttributeType): SQBuilder<Model, Data>;
    /**
     * @description Add "Not In" attribute filter
     * @param {MultipleAttributeType} value
     * @return {SQBuilder} This builder
     */
    notIn(value: MultipleAttributeType): SQBuilder<Model, Data>;
    /**
     * @description Add "Less Than" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    lt(value: SingleAttributeType): SQBuilder<Model, Data>;
    /**
     * @description Add "Less Than or Equal" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    lte(value: SingleAttributeType): SQBuilder<Model, Data>;
    /**
     * @description Add "Greater Than" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    gt(value: SingleAttributeType): SQBuilder<Model, Data>;
    /**
     * @description Add "Greater Than or Equal" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    gte(value: SingleAttributeType): SQBuilder<Model, Data>;
    /**
     * @description Add "Contains" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    contains(value: SingleAttributeType): SQBuilder<Model, Data>;
    /**
     * @description Add "Not Contains" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    notContains(value: SingleAttributeType): SQBuilder<Model, Data>;
    /**
     * @description Add "Contains case-insensitive" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    containsi(value: SingleAttributeType): SQBuilder<Model, Data>;
    /**
     * @description Add "Not Contains case-insensitive" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    notContainsi(value: SingleAttributeType): SQBuilder<Model, Data>;
    /**
     * @description Add "Start with" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    startsWith(value: SingleAttributeType): SQBuilder<Model, Data>;
    /**
     * @description Add "Ends with" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    endsWith(value: SingleAttributeType): SQBuilder<Model, Data>;
    /**
     * @description Add "Is null" attribute filter
     * @param {boolean} value
     * @return {SQBuilder} This builder
     */
    null(value: boolean): SQBuilder<Model, Data>;
    /**
     * @description Add "Is not null" attribute filter
     * @param {boolean} value
     * @return {SQBuilder} This builder
     */
    notNull(value: boolean): SQBuilder<Model, Data>;
    /**
     * @description Add "Between" attribute filter
     * @param {MultipleAttributeType} value
     * @return {SQBuilder} This builder
     */
    between(value: MultipleAttributeType): SQBuilder<Model, Data>;
    private _addAttribute;
    private _addToFilter;
    /**
     * @description Populate query can be simple populate or complex nested populate with builder callback
     * @param {StrapiPopulationInputQuery} populateQuery
     * @param {PopulationInputCallback} nestedCallback Provides callback with new builder for nested filtering, sorting and fields selection
     * @return {SQBuilder} This builder
     */
    populate<PopulateModel extends object>(populateQuery: StrapiPopulationInputQuery<Model>, nestedCallback?: PopulationInputCallback<PopulateModel>): SQBuilder<Model, Data>;
    /**
     * @description Add populate fragments for dynamic zones
     * @param {string} componentTypeKey Component type key
     * @param {PopulationInputCallback} nestedCallback Component Builder
     * @return {SQBuilder} This builder
     */
    on<PopulateModel extends object>(componentTypeKey: string, nestedCallback: PopulationInputCallback<PopulateModel>): SQBuilder<Model, Data>;
    private _addToPopulate;
    private static _parsePopulation;
    private static _isNotArrayOfPopKeys;
    private static _isArrayOfPopKeys;
    private static _isDefaultQueryPopulation;
    /**
     * @description Select model fields
     * @description Same keys will be merged
     * @param {StrapiFieldsInputQuery} fields
     * @return {SQBuilder} This builder
     */
    fields(fields: StrapiFieldsInputQuery<Model>): SQBuilder<Model, Data>;
    /**
     * @description Add sorting
     * @description Same keys will be merged
     * @param {StrapiSortInputQuery} sortQuery
     * @return {SQBuilder} This builder
     */
    sort(sortQuery: StrapiSortInputQuery<Model>): SQBuilder<Model, Data>;
    private static _createSortObject;
    private static _createSortObjectArray;
    private static _parseSortObject;
    private static _isSortObject;
    private static _isSortKey;
    private static _isSortArray;
    private static _isArrayOfKeys;
    /**
     * @description Add StrapiService pagination
     * @param {number} page
     * @return {SQBuilder} This builder
     */
    page(page: number): SQBuilder<Model, Data>;
    pageSize(pageSize: number): SQBuilder<Model, Data>;
    pageStart(start: number): SQBuilder<Model, Data>;
    pageLimit(limit: number): SQBuilder<Model, Data>;
    /**
     * @description Add Any input data to query
     * @param {object} dataObject
     * @return {SQBuilder} This builder
     */
    data(dataObject: Data): SQBuilder<Model, Data>;
    /**
     * @description Create builder readonly that all filter methods don't change query state
     * @param {boolean} isReadonly
     * @return {SQBuilder} This builder
     */
    readonly(isReadonly?: boolean): SQBuilder<Model, Data>;
    /**
     * @description Get raw filters info
     * @return {StrapiRawFilters} Parsed filters
     */
    getRawFilters(): StrapiRawFilters<Model>;
    /**
     * @description Get fields selection data
     * @return {StrapiFields} Parsed fields data
     */
    getRawFields(): StrapiFields<Model>;
    /**
     * @description Get raw sort data
     * @return {StrapiSort[]} Parsed sort data
     */
    getRawSort(): StrapiSort<Model>[];
    /**
     * @description Get population data
     * @return {StrapiPopulation} Parsed population data
     */
    getRawPopulation(): StrapiPopulation<Model, any>[];
    /**
     * @description Get full raw query
     * @return {QueryRawInfo} Parsed population data
     */
    getRawQuery(): QueryRawInfo<Model, Data>;
    /**
     * @description Get raw sort data
     * @return {pagination?: StrapiPagination, offsetPagination?: StrapiOffsetPagination} Parsed sort data
     */
    getRawPagination(): {
        pagination?: StrapiPagination;
        offsetPagination?: StrapiOffsetPagination;
    };
    /**
     * @description Set builder prev population key
     * @description
     */
    setPrevPopulationKey<PopulationModel extends object>(populationKey: PopulationKey<PopulationModel>): void;
    /**
     * @description Get population by key
     * @param {PopulationKey} populationKey
     * @return {StrapiPopulation | undefined} Population object
     */
    getPopulationByKey<PopulationModel extends object>(populationKey: PopulationKey<Model>): StrapiPopulation<Model, PopulationModel> | undefined;
    /**
     * @description Merge external builder pagination
     * @param {SQBuilder} builder External builder
     * @return {SQBuilder} This builder
     */
    joinPagination<T extends object, F extends object>(builder: SQBuilder<T, F>): SQBuilder<Model, Data>;
    /**
     * @description Merge external builder population
     * @param {SQBuilder} builder External builder
     * @return {SQBuilder} This builder
     */
    joinPopulation<T extends object, F extends object>(builder: SQBuilder<T, F>): SQBuilder<Model, Data>;
    /**
     * @description Merge external builder filters
     * @param {SQBuilder} builder External builder
     * @param {boolean} mergeRootLogical If true on first level merged filter override root logical if used with its add root logical to nested builder not this
     * @return {SQBuilder} This builder
     */
    joinFilters<T extends object, F extends object>(builder: SQBuilder<T, F>, mergeRootLogical?: boolean): SQBuilder<Model, Data>;
    /**
     * @description Merge external builder sorts
     * @param {SQBuilder} builder External builder
     * @return {SQBuilder} This builder
     */
    joinSort(builder: SQBuilder<Model, Data>): SQBuilder<Model, Data>;
    /**
     * @description Merge external builder fields
     * @param {SQBuilder} builder External builder
     * @return {SQBuilder} This builder
     */
    joinFields(builder: SQBuilder<Model, Data>): SQBuilder<Model, Data>;
    private static _buildQuery;
    private static _isQueryEngine;
    private static _parsePagination;
    private static _parseSort;
    private static _parseAttributeFilter;
    private static _parseFilters;
    private static _isMoreThanOneFilter;
    private static _parsePopulate;
    private static _isPopulateComplex;
}
//# sourceMappingURL=sq-builder.d.ts.map