import { BuilderConfig, FilterInputCallback, FilterKey, MultipleAttributeType, PopulationInputCallback, PopulationKey, QueryRawInfo, QueryTypes, SingleAttributeType, StrapiEntityQuery, StrapiFields, StrapiFieldsInputQuery, StrapiOffsetPagination, StrapiPagination, StrapiPopulation, StrapiPopulationInputQuery, StrapiRawFilters, StrapiSort, StrapiSortInputQuery } from "./sq-builder-types";
export default class Index<Model extends object, Data extends object = {}> {
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
     * @return {StrapiEntityQuery} Built query
     */
    build(queryType?: QueryTypes): StrapiEntityQuery<Model, Data>;
    /**
     * @description Build Strapi query for Strapi service
     * @return {StrapiEntityQuery} Built query
     */
    buildStrapiService(): StrapiEntityQuery<Model, Data>;
    /**
     * @description Build Strapi query for Entity service
     * @return {StrapiEntityQuery} Built query
     */
    buildEntityService(): StrapiEntityQuery<Model, Data>;
    /**
     * @description Build Strapi query for Query service
     * @return {StrapiEntityQuery} Built query
     */
    buildQueryEngine(): StrapiEntityQuery<Model, Data>;
    /**
     * @description Start filter query
     * @description If the attribute is empty, it expects a logical filter or a nested filter "with"
     * @param {FilterInputCallback| FilterKey} attribute Can be key or callback with same builder for visual filter grouping
     * @param {FilterInputCallback} thisCallback Provides same builder to group filters chains
     * @return {Index} This builder
     */
    filters(attribute?: FilterInputCallback<Model, Data> | FilterKey<Model>, thisCallback?: FilterInputCallback<Model, any>): Index<Model, Data>;
    /**
     * Add deep nested filters to current filters
     * Callback provide new builder
     * @param nestedCallback
     */
    with<NestedModel extends object = {}>(nestedCallback: FilterInputCallback<NestedModel, any>): Index<Model, Data>;
    /**
     * @description Negates current attribute or logical filter
     * @return {Index} This builder
     */
    not(): Index<Model, Data>;
    /**
     * @description Add logical OR filter.
     * @return {Index} This builder
     */
    or(): Index<Model, Data>;
    /**
     * @description Add logical AND filter.
     * @return {Index} This builder
     */
    and(): Index<Model, Data>;
    /**
     * @description Add "Equal" attribute filter
     * @param {SingleAttributeType} value
     * @return {Index} This builder
     */
    eq(value: SingleAttributeType): Index<Model, Data>;
    /**
     * @description Add "Equal insensitive" attribute filter
     * @param {SingleAttributeType} value
     * @return {Index} This builder
     */
    eqi(value: SingleAttributeType): Index<Model, Data>;
    /**
     * @description Add "Not Equal" attribute filter
     * @param {SingleAttributeType} value
     * @return {Index} This builder
     */
    ne(value: SingleAttributeType): Index<Model, Data>;
    /**
     * @description Add "In" attribute filter
     * @param {MultipleAttributeType} value
     * @return {Index} This builder
     */
    in(value: MultipleAttributeType): Index<Model, Data>;
    /**
     * @description Add "Not In" attribute filter
     * @param {MultipleAttributeType} value
     * @return {Index} This builder
     */
    notIn(value: MultipleAttributeType): Index<Model, Data>;
    /**
     * @description Add "Less Than" attribute filter
     * @param {SingleAttributeType} value
     * @return {Index} This builder
     */
    lt(value: SingleAttributeType): Index<Model, Data>;
    /**
     * @description Add "Less Than or Equal" attribute filter
     * @param {SingleAttributeType} value
     * @return {Index} This builder
     */
    lte(value: SingleAttributeType): Index<Model, Data>;
    /**
     * @description Add "Greater Than" attribute filter
     * @param {SingleAttributeType} value
     * @return {Index} This builder
     */
    gt(value: SingleAttributeType): Index<Model, Data>;
    /**
     * @description Add "Greater Than or Equal" attribute filter
     * @param {SingleAttributeType} value
     * @return {Index} This builder
     */
    gte(value: SingleAttributeType): Index<Model, Data>;
    /**
     * @description Add "Contains" attribute filter
     * @param {SingleAttributeType} value
     * @return {Index} This builder
     */
    contains(value: SingleAttributeType): Index<Model, Data>;
    /**
     * @description Add "Not Contains" attribute filter
     * @param {SingleAttributeType} value
     * @return {Index} This builder
     */
    notContains(value: SingleAttributeType): Index<Model, Data>;
    /**
     * @description Add "Contains case-insensitive" attribute filter
     * @param {SingleAttributeType} value
     * @return {Index} This builder
     */
    containsi(value: SingleAttributeType): Index<Model, Data>;
    /**
     * @description Add "Not Contains case-insensitive" attribute filter
     * @param {SingleAttributeType} value
     * @return {Index} This builder
     */
    notContainsi(value: SingleAttributeType): Index<Model, Data>;
    /**
     * @description Add "Start with" attribute filter
     * @param {SingleAttributeType} value
     * @return {Index} This builder
     */
    startsWith(value: SingleAttributeType): Index<Model, Data>;
    /**
     * @description Add "Ends with" attribute filter
     * @param {SingleAttributeType} value
     * @return {Index} This builder
     */
    endsWith(value: SingleAttributeType): Index<Model, Data>;
    /**
     * @description Add "Is null" attribute filter
     * @param {boolean} value
     * @return {Index} This builder
     */
    null(value: boolean): Index<Model, Data>;
    /**
     * @description Add "Is not null" attribute filter
     * @param {boolean} value
     * @return {Index} This builder
     */
    notNull(value: boolean): Index<Model, Data>;
    /**
     * @description Add "Between" attribute filter
     * @param {MultipleAttributeType} value
     * @return {Index} This builder
     */
    between(value: MultipleAttributeType): Index<Model, Data>;
    private _addAttribute;
    private _addToFilter;
    /**
     * @description Add query populate
     * @description Can be as a simple key or take a callback for nested query
     * @param {StrapiPopulationInputQuery} populateQuery
     * @param {PopulationInputCallback} nestedCallback Provides callback with new builder for nested filtering, sorting and fields selection
     * @return {Index} This builder
     */
    populate<PopulateModel extends object>(populateQuery: StrapiPopulationInputQuery<Model>, nestedCallback?: PopulationInputCallback<PopulateModel>): Index<Model, Data>;
    /**
     * @description Add populate fragments for dynamic zones
     * @param {string} componentTypeKey Component type key
     * @param {PopulationInputCallback} nestedCallback Dynamic component builder
     * @return {Index} This builder
     */
    on<PopulateModel extends object>(componentTypeKey: string, nestedCallback: PopulationInputCallback<PopulateModel>): Index<Model, Data>;
    private _addToPopulate;
    private static _parsePopulation;
    private static _isNotArrayOfPopKeys;
    private static _isArrayOfPopKeys;
    private static _isDefaultQueryPopulation;
    /**
     * @description Add filed selection to query
     * @description Same keys will be merged
     * @param {StrapiFieldsInputQuery} fields
     * @return {Index} This builder
     */
    fields(fields: StrapiFieldsInputQuery<Model>): Index<Model, Data>;
    /**
     * @description Add sorting to query
     * @description Same keys will be merged
     * @param {StrapiSortInputQuery} sortQuery
     * @return {Index} This builder
     */
    sort(sortQuery: StrapiSortInputQuery<Model>): Index<Model, Data>;
    private static _createSortObject;
    private static _createSortObjectArray;
    private static _parseSortObject;
    private static _isSortObject;
    private static _isSortKey;
    private static _isSortArray;
    private static _isArrayOfKeys;
    /**
     * @description Add StrapiService like page
     * @param {number} page
     * @return {Index} This builder
     */
    page(page: number): Index<Model, Data>;
    /**
     * @description Add StrapiService like page size
     * @param {number} pageSize
     * @return {Index} This builder
     */
    pageSize(pageSize: number): Index<Model, Data>;
    /**
     * @description Add Offset like page start
     * @param {number} start
     * @return {Index} This builder
     */
    pageStart(start: number): Index<Model, Data>;
    /**
     * @description Add Offset like page limit
     * @param {number} limit
     * @return {Index} This builder
     */
    pageLimit(limit: number): Index<Model, Data>;
    /**
     * @description Add Any input data to query
     * @param {object} dataObject
     * @return {Index} This builder
     */
    data(dataObject: Data): Index<Model, Data>;
    /**
     * @description Make the builder read-only that all filter methods don't change query state
     * @param {boolean} isReadonly
     * @return {Index} This builder
     */
    readonly(isReadonly?: boolean): Index<Model, Data>;
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
     * @description Get raw pagination
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
     * @description Get builder prev population by key
     * @param {PopulationKey} populationKey
     * @return {StrapiPopulation | undefined} Population object
     */
    getPopulationByKey<PopulationModel extends object>(populationKey: PopulationKey<Model>): StrapiPopulation<Model, PopulationModel> | undefined;
    /**
     * @description Merge external builder pagination
     * @param {Index} builder External builder
     * @return {Index} This builder
     */
    joinPagination<T extends object, F extends object>(builder: Index<T, F>): Index<Model, Data>;
    /**
     * @description Merge external builder population
     * @param {Index} builder External builder
     * @return {Index} This builder
     */
    joinPopulation<T extends object, F extends object>(builder: Index<T, F>): Index<Model, Data>;
    /**
     * @description Merge external builder filters
     * @param {Index} builder External builder
     * @param {boolean} mergeRootLogical If true, the main logic filter will be overwritten by the input
     * @return {Index} This builder
     */
    joinFilters<T extends object, F extends object>(builder: Index<T, F>, mergeRootLogical?: boolean): Index<Model, Data>;
    /**
     * @description Merge external builder sorts
     * @param {Index} builder External builder
     * @return {Index} This builder
     */
    joinSort(builder: Index<Model, Data>): Index<Model, Data>;
    /**
     * @description Merge external builder fields
     * @param {Index} builder External builder
     * @return {Index} This builder
     */
    joinFields(builder: Index<Model, Data>): Index<Model, Data>;
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
//# sourceMappingURL=index.d.ts.map