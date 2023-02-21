export default class Index {
    constructor(builderConfig) {
        this._query = {
            sort: [],
            filters: {
                rootLogical: "$and",
                attributeFilters: [],
            },
            population: [],
            fields: [],
        };
        this._builderConfig = {
            defaultSort: "asc",
        };
        this._nextAttributeNegate = false;
        this._isReadonly = false;
        if (builderConfig) {
            this._builderConfig = { ...this._builderConfig, ...builderConfig };
        }
    }
    //<editor-fold desc="Build functions">
    /**
     * @description Build Strapi query
     * @param {QueryTypes} queryType Default StrapiService
     * @return {StrapiEntityQuery} Built query
     */
    build(queryType = "strapiService") {
        switch (queryType) {
            case "entityService": {
                return this.buildEntityService();
            }
            case "queryEngine": {
                return this.buildQueryEngine();
            }
            case "strapiService": {
                return this.buildStrapiService();
            }
            default: {
                return this.buildStrapiService();
            }
        }
    }
    /**
     * @description Build Strapi query for Strapi service
     * @return {StrapiEntityQuery} Built query
     */
    buildStrapiService() {
        return Index._buildQuery(this._query, "strapiService");
    }
    /**
     * @description Build Strapi query for Entity service
     * @return {StrapiEntityQuery} Built query
     */
    buildEntityService() {
        return Index._buildQuery(this._query, "entityService");
    }
    /**
     * @description Build Strapi query for Query service
     * @return {StrapiEntityQuery} Built query
     */
    buildQueryEngine() {
        return Index._buildQuery(this._query, "queryEngine");
    }
    //</editor-fold>
    //<editor-fold desc="Filters functions">
    /**
     * @description Start filter query
     * @description If the attribute is empty, it expects a logical filter or a nested filter "with"
     * @param {FilterInputCallback| FilterKey} attribute Can be key or callback with same builder for visual filter grouping
     * @param {FilterInputCallback} thisCallback Provides same builder to group filters chains
     * @return {Index} This builder
     */
    filters(attribute, thisCallback) {
        if (this._isReadonly) {
            return this;
        }
        if (typeof attribute === "function") {
            attribute(this);
            return this;
        }
        if (attribute !== undefined) {
            this._prevFilterKey = attribute;
        }
        if (thisCallback !== undefined && typeof thisCallback === "function") {
            thisCallback(this);
            return this;
        }
        return this;
    }
    /**
     * Add deep nested filters to current filters
     * Callback provide new builder
     * @param nestedCallback
     */
    with(nestedCallback) {
        if (this._isReadonly) {
            return this;
        }
        const nestedBuilder = new Index();
        nestedCallback(nestedBuilder);
        this._addToFilter({
            key: this._prevFilterKey,
            nested: nestedBuilder.getRawFilters(),
        }, () => {
            this._prevFilterKey = undefined;
        });
        return this;
    }
    //<editor-fold desc="Logical filters">
    /**
     * @description Negates current attribute or logical filter
     * @return {Index} This builder
     */
    not() {
        if (this._isReadonly) {
            return this;
        }
        const target = this._prevFilterKey !== undefined ? "attribute" : "negateRoot";
        target === "negateRoot"
            ? (this._query.filters.negate = true)
            : (this._nextAttributeNegate = true);
        return this;
    }
    /**
     * @description Add logical OR filter.
     * @return {Index} This builder
     */
    or() {
        if (this._isReadonly) {
            return this;
        }
        this._query.filters.rootLogical = "$or";
        return this;
    }
    /**
     * @description Add logical AND filter.
     * @return {Index} This builder
     */
    and() {
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
     * @return {Index} This builder
     */
    eq(value) {
        return this._addAttribute("$eq", value);
    }
    /**
     * @description Add "Equal insensitive" attribute filter
     * @param {SingleAttributeType} value
     * @return {Index} This builder
     */
    eqi(value) {
        return this._addAttribute("$eqi", value);
    }
    /**
     * @description Add "Not Equal" attribute filter
     * @param {SingleAttributeType} value
     * @return {Index} This builder
     */
    ne(value) {
        return this._addAttribute("$ne", value);
    }
    /**
     * @description Add "In" attribute filter
     * @param {MultipleAttributeType} value
     * @return {Index} This builder
     */
    in(value) {
        return this._addAttribute("$in", value);
    }
    /**
     * @description Add "Not In" attribute filter
     * @param {MultipleAttributeType} value
     * @return {Index} This builder
     */
    notIn(value) {
        return this._addAttribute("$notIn", value);
    }
    /**
     * @description Add "Less Than" attribute filter
     * @param {SingleAttributeType} value
     * @return {Index} This builder
     */
    lt(value) {
        return this._addAttribute("$lt", value);
    }
    /**
     * @description Add "Less Than or Equal" attribute filter
     * @param {SingleAttributeType} value
     * @return {Index} This builder
     */
    lte(value) {
        return this._addAttribute("$lte", value);
    }
    /**
     * @description Add "Greater Than" attribute filter
     * @param {SingleAttributeType} value
     * @return {Index} This builder
     */
    gt(value) {
        return this._addAttribute("$gt", value);
    }
    /**
     * @description Add "Greater Than or Equal" attribute filter
     * @param {SingleAttributeType} value
     * @return {Index} This builder
     */
    gte(value) {
        return this._addAttribute("$gte", value);
    }
    /**
     * @description Add "Contains" attribute filter
     * @param {SingleAttributeType} value
     * @return {Index} This builder
     */
    contains(value) {
        return this._addAttribute("$contains", value);
    }
    /**
     * @description Add "Not Contains" attribute filter
     * @param {SingleAttributeType} value
     * @return {Index} This builder
     */
    notContains(value) {
        return this._addAttribute("$notContains", value);
    }
    /**
     * @description Add "Contains case-insensitive" attribute filter
     * @param {SingleAttributeType} value
     * @return {Index} This builder
     */
    containsi(value) {
        return this._addAttribute("$containsi", value);
    }
    /**
     * @description Add "Not Contains case-insensitive" attribute filter
     * @param {SingleAttributeType} value
     * @return {Index} This builder
     */
    notContainsi(value) {
        return this._addAttribute("$notContainsi", value);
    }
    /**
     * @description Add "Start with" attribute filter
     * @param {SingleAttributeType} value
     * @return {Index} This builder
     */
    startsWith(value) {
        return this._addAttribute("$startsWith", value);
    }
    /**
     * @description Add "Ends with" attribute filter
     * @param {SingleAttributeType} value
     * @return {Index} This builder
     */
    endsWith(value) {
        return this._addAttribute("$endsWith", value);
    }
    /**
     * @description Add "Is null" attribute filter
     * @param {boolean} value
     * @return {Index} This builder
     */
    null(value) {
        return this._addAttribute("$null", value);
    }
    /**
     * @description Add "Is not null" attribute filter
     * @param {boolean} value
     * @return {Index} This builder
     */
    notNull(value) {
        return this._addAttribute("$notNull", value);
    }
    /**
     * @description Add "Between" attribute filter
     * @param {MultipleAttributeType} value
     * @return {Index} This builder
     */
    between(value) {
        return this._addAttribute("$between", value);
    }
    //</editor-fold>
    //<editor-fold desc="Filter private actions">
    _addAttribute(type, value) {
        if (this._isReadonly) {
            return this;
        }
        if (this._prevFilterKey !== undefined) {
            this._addToFilter({
                key: this._prevFilterKey,
                type: type,
                value,
                negate: this._nextAttributeNegate,
            }, () => {
                this._prevFilterKey = undefined;
                this._nextAttributeNegate = false;
            });
        }
        return this;
    }
    _addToFilter(filter, onAdded) {
        this._query.filters.attributeFilters.push(filter);
        onAdded && onAdded();
    }
    //</editor-fold>
    //</editor-fold>
    //<editor-fold desc="Population">
    /**
     * @description Add query populate
     * @description Can be as a simple key or take a callback for nested query
     * @param {StrapiPopulationInputQuery} populateQuery
     * @param {PopulationInputCallback} nestedCallback Provides callback with new builder for nested filtering, sorting and fields selection
     * @return {Index} This builder
     */
    populate(populateQuery, nestedCallback) {
        if (this._isReadonly) {
            return this;
        }
        let nestedBuilder = undefined;
        const parsedPopulateQuery = Index._parsePopulation(populateQuery);
        const singlePopulateQuery = parsedPopulateQuery[0];
        if (nestedCallback !== undefined && typeof nestedCallback === "function") {
            nestedBuilder = new Index({
                defaultSort: this._builderConfig.defaultSort,
            });
            nestedBuilder.setPrevPopulationKey(singlePopulateQuery.key);
            nestedCallback(nestedBuilder);
        }
        if (nestedBuilder) {
            const findMorph = nestedBuilder.getPopulationByKey(singlePopulateQuery.key);
            const isMorphData = findMorph !== undefined &&
                !Index._isDefaultQueryPopulation(findMorph.nestedQuery);
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
     * @param {PopulationInputCallback} nestedCallback Dynamic component builder
     * @return {Index} This builder
     */
    on(componentTypeKey, nestedCallback) {
        if (this._isReadonly) {
            return this;
        }
        if (this._prevPopulateKey === undefined) {
            return this;
        }
        const populationIndex = this._query.population.findIndex((p) => p.key === this._prevPopulateKey);
        const nestedBuilder = new Index({
            defaultSort: this._builderConfig.defaultSort,
        });
        nestedCallback(nestedBuilder);
        const newQuery = {};
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
                key: this._prevPopulateKey,
                nestedQuery: newQuery,
            });
        }
        else {
            const populationQuery = this._query.population[populationIndex];
            this._query.population[populationIndex] = {
                key: this._prevPopulateKey,
                nestedQuery: { ...populationQuery.nestedQuery, ...newQuery },
            };
        }
        return this;
    }
    _addToPopulate(populate) {
        if (populate.key === "*") {
            this._query.population = [{ key: populate.key }];
            return;
        }
        const founded = this._query.population.findIndex((f) => {
            return f.key === populate.key;
        });
        if (founded === -1) {
            this._query.population.push(populate);
        }
        else {
            this._query.population[founded] = populate;
        }
    }
    static _parsePopulation(populationQuery) {
        if (populationQuery === "*") {
            return [{ key: "*" }];
        }
        if (this._isArrayOfPopKeys(populationQuery)) {
            return populationQuery.map((s) => ({ key: s }));
        }
        if (this._isNotArrayOfPopKeys(populationQuery)) {
            return [{ key: populationQuery }];
        }
    }
    static _isNotArrayOfPopKeys(query) {
        return !Array.isArray(query);
    }
    static _isArrayOfPopKeys(query) {
        return Array.isArray(query);
    }
    static _isDefaultQueryPopulation(query) {
        return ("sort" in query ||
            "filters" in query ||
            "population" in query ||
            "fields" in query);
    }
    //</editor-fold>
    //<editor-fold desc="Fields">
    /**
     * @description Add filed selection to query
     * @description Same keys will be merged
     * @param {StrapiFieldsInputQuery} fields
     * @return {Index} This builder
     */
    fields(fields) {
        if (this._isReadonly) {
            return this;
        }
        const nowFields = this._query.fields;
        this._query.fields = _union(nowFields, Array.isArray(fields) ? fields : [fields]);
        return this;
    }
    //</editor-fold>
    //<editor-fold desc="Sort">
    /**
     * @description Add sorting to query
     * @description Same keys will be merged
     * @param {StrapiSortInputQuery} sortQuery
     * @return {Index} This builder
     */
    sort(sortQuery) {
        if (this._isReadonly) {
            return this;
        }
        const nowSortValue = this._query.sort;
        const parsedSortQuery = Index._parseSortObject(sortQuery, this._builderConfig.defaultSort);
        this._query.sort = _unionBy(Array.isArray(nowSortValue) ? nowSortValue : [nowSortValue], Array.isArray(parsedSortQuery) ? parsedSortQuery : [parsedSortQuery], (v) => v.key);
        return this;
    }
    static _createSortObject(stringKey, defaultSort) {
        return { key: stringKey, type: defaultSort };
    }
    static _createSortObjectArray(stringArray, defaultSort) {
        return stringArray.map((s) => Index._createSortObject(s, defaultSort));
    }
    static _parseSortObject(sortQuery, defaultSort) {
        if (this._isSortArray(sortQuery)) {
            if (this._isArrayOfKeys(sortQuery)) {
                return Index._createSortObjectArray(sortQuery, defaultSort);
            }
            else {
                return sortQuery;
            }
        }
        else {
            if (this._isSortObject(sortQuery)) {
                return sortQuery;
            }
            if (this._isSortKey(sortQuery)) {
                return Index._createSortObject(sortQuery, defaultSort);
            }
        }
    }
    static _isSortObject(sortQuery) {
        return typeof sortQuery === "object";
    }
    static _isSortKey(sortQuery) {
        return typeof sortQuery === "string";
    }
    static _isSortArray(sortQuery) {
        return Array.isArray(sortQuery);
    }
    static _isArrayOfKeys(sortQuery
    // @ts-ignore
    ) {
        return (this._isSortArray(sortQuery) &&
            sortQuery.every((s) => !!this._isSortKey(s)));
    }
    //</editor-fold>
    // <editor-fold desc="Pagination">
    /**
     * @description Add StrapiService like page
     * @param {number} page
     * @return {Index} This builder
     */
    page(page) {
        if (this._isReadonly) {
            return this;
        }
        this._query.pagination = { ...this._query.pagination, page };
        return this;
    }
    /**
     * @description Add StrapiService like page size
     * @param {number} pageSize
     * @return {Index} This builder
     */
    pageSize(pageSize) {
        if (this._isReadonly) {
            return this;
        }
        this._query.pagination = { ...this._query.pagination, pageSize };
        return this;
    }
    /**
     * @description Add Offset like page start
     * @param {number} start
     * @return {Index} This builder
     */
    pageStart(start) {
        if (this._isReadonly) {
            return this;
        }
        this._query.offsetPagination = { ...this._query.offsetPagination, start };
        return this;
    }
    /**
     * @description Add Offset like page limit
     * @param {number} limit
     * @return {Index} This builder
     */
    pageLimit(limit) {
        if (this._isReadonly) {
            return this;
        }
        this._query.offsetPagination = {
            ...this._query.offsetPagination,
            limit,
        };
        return this;
    }
    // </editor-fold>
    // <editor-fold desc="Data">
    /**
     * @description Add Any input data to query
     * @param {object} dataObject
     * @return {Index} This builder
     */
    data(dataObject) {
        if (this._isReadonly) {
            return this;
        }
        this._query.data = dataObject;
        return this;
    }
    // </editor-fold>
    // <editor-fold desc="Raw query utils">
    /**
     * @description Make the builder read-only that all filter methods don't change query state
     * @param {boolean} isReadonly
     * @return {Index} This builder
     */
    readonly(isReadonly) {
        this._isReadonly = isReadonly === undefined ? true : isReadonly;
        return this;
    }
    /**
     * @description Get raw filters info
     * @return {StrapiRawFilters} Parsed filters
     */
    getRawFilters() {
        return this._query.filters;
    }
    /**
     * @description Get fields selection data
     * @return {StrapiFields} Parsed fields data
     */
    getRawFields() {
        return this._query.fields;
    }
    /**
     * @description Get raw sort data
     * @return {StrapiSort[]} Parsed sort data
     */
    getRawSort() {
        return this._query.sort;
    }
    /**
     * @description Get population data
     * @return {StrapiPopulation} Parsed population data
     */
    getRawPopulation() {
        return this._query.population;
    }
    /**
     * @description Get full raw query
     * @return {QueryRawInfo} Parsed population data
     */
    getRawQuery() {
        return this._query;
    }
    /**
     * @description Get raw pagination
     * @return {pagination?: StrapiPagination, offsetPagination?: StrapiOffsetPagination} Parsed sort data
     */
    getRawPagination() {
        return {
            pagination: this._query.pagination,
            offsetPagination: this._query.offsetPagination,
        };
    }
    /**
     * @description Set builder prev population key
     * @description
     */
    setPrevPopulationKey(populationKey) {
        this._prevPopulateKey = populationKey;
    }
    /**
     * @description Get builder prev population by key
     * @param {PopulationKey} populationKey
     * @return {StrapiPopulation | undefined} Population object
     */
    getPopulationByKey(populationKey) {
        return this._query.population.find((p) => p.key === populationKey);
    }
    // </editor-fold>
    //<editor-fold desc="Merge utils">
    /**
     * @description Merge external builder pagination
     * @param {Index} builder External builder
     * @return {Index} This builder
     */
    joinPagination(builder) {
        if (this._isReadonly) {
            return this;
        }
        const externalPagination = builder.getRawPagination();
        this._query.pagination = externalPagination.pagination;
        this._query.offsetPagination = externalPagination.offsetPagination;
        return this;
    }
    /**
     * @description Merge external builder population
     * @param {Index} builder External builder
     * @return {Index} This builder
     */
    joinPopulation(builder) {
        if (this._isReadonly) {
            return this;
        }
        const externalPopulation = builder.getRawPopulation();
        this._query.population = _unionBy(this._query.population, externalPopulation, (p) => p.key);
        return this;
    }
    /**
     * @description Merge external builder filters
     * @param {Index} builder External builder
     * @param {boolean} mergeRootLogical If true, the main logic filter will be overwritten by the input
     * @return {Index} This builder
     */
    joinFilters(builder, mergeRootLogical = false) {
        if (this._isReadonly) {
            return this;
        }
        const externalFilters = builder.getRawFilters();
        this._query.filters.attributeFilters =
            this._query.filters.attributeFilters.concat(externalFilters.attributeFilters);
        this._query.filters.negate = externalFilters.negate;
        if (mergeRootLogical) {
            this._query.filters.rootLogical = externalFilters.rootLogical;
        }
        return this;
    }
    /**
     * @description Merge external builder sorts
     * @param {Index} builder External builder
     * @return {Index} This builder
     */
    joinSort(builder) {
        if (this._isReadonly) {
            return this;
        }
        const externalSort = builder.getRawSort();
        this._query.sort = _unionBy(this._query.sort, externalSort, (s) => s.key);
        return this;
    }
    /**
     * @description Merge external builder fields
     * @param {Index} builder External builder
     * @return {Index} This builder
     */
    joinFields(builder) {
        if (this._isReadonly) {
            return this;
        }
        const externalFields = builder.getRawFields();
        this._query.fields = _union(this._query.fields, externalFields);
        return this;
    }
    //</editor-fold>
    // <editor-fold desc="Query parsing utils">
    static _buildQuery(rawQuery, queryType = "strapiService") {
        var _a;
        const isQueryEngine = this._isQueryEngine(queryType);
        let parsedQuery = {};
        // Parsed sort values the same in service, entity service and query engine
        const sort = Index._parseSort(rawQuery.sort);
        if (sort !== undefined) {
            parsedQuery[isQueryEngine ? "orderBy" : "sort"] = sort;
        }
        // Fields values the same in service, entity service and query engine
        if ((_a = rawQuery === null || rawQuery === void 0 ? void 0 : rawQuery.fields) === null || _a === void 0 ? void 0 : _a.some((f) => !!f)) {
            parsedQuery[isQueryEngine ? "select" : "fields"] = rawQuery.fields;
        }
        // Filter values the same in service, entity service and query engine
        const filters = Index._parseFilters(rawQuery.filters);
        if (filters !== undefined) {
            parsedQuery[isQueryEngine ? "where" : "filters"] = filters;
        }
        // Populate calls build for nested query
        const populate = Index._parsePopulate(rawQuery.population, queryType);
        if (populate !== undefined) {
            parsedQuery.populate = populate;
        }
        // Pagination for strapi service, entity service and query engine is different
        const pagination = this._parsePagination(queryType, rawQuery.pagination, rawQuery.offsetPagination);
        if (pagination !== undefined) {
            parsedQuery.pagination = pagination;
        }
        // Data pass without any mods
        if ((rawQuery === null || rawQuery === void 0 ? void 0 : rawQuery.data) !== undefined) {
            parsedQuery.data = rawQuery.data;
        }
        return parsedQuery;
    }
    static _isQueryEngine(queryType) {
        return queryType === "queryEngine";
    }
    static _parsePagination(queryType, pagination, offsetPagination) {
        if (offsetPagination !== undefined) {
            return offsetPagination;
        }
        if (pagination !== undefined && queryType !== "queryEngine") {
            return pagination;
        }
    }
    static _parseSort(sorts) {
        let sortQuery = undefined;
        if (sorts === null || sorts === void 0 ? void 0 : sorts.some((s) => !!s)) {
            const isOneSort = sorts.length === 1;
            if (isOneSort) {
                const firstSort = sorts[0];
                sortQuery = _set({}, firstSort.key, firstSort.type);
            }
            else {
                sortQuery = [];
                for (const sort of sorts) {
                    sortQuery.push(_set({}, sort.key, sort.type));
                }
            }
        }
        return sortQuery;
    }
    static _parseAttributeFilter(filter) {
        if (filter.nested !== undefined) {
            const nestedFilters = this._parseFilters(filter.nested);
            if (nestedFilters === undefined) {
                return undefined;
            }
            return filter.key === undefined
                ? nestedFilters
                : _set({}, filter.key, nestedFilters);
        }
        if (filter.value === undefined || filter.type === undefined) {
            return undefined;
        }
        return filter.negate
            ? _set({}, filter.key, {
                ["$not"]: {
                    [filter.type]: filter.value,
                },
            })
            : _set({}, filter.key, {
                [filter.type]: filter.value,
            });
    }
    static _parseFilters(rawFilters) {
        const attributeFilters = (rawFilters === null || rawFilters === void 0 ? void 0 : rawFilters.attributeFilters) || [];
        const rootLogical = (rawFilters === null || rawFilters === void 0 ? void 0 : rawFilters.rootLogical) || "$and";
        const negateRoot = (rawFilters === null || rawFilters === void 0 ? void 0 : rawFilters.negate) || false;
        const parsedFilters = [];
        for (const attributeQuery of attributeFilters) {
            const parsedAttribute = Index._parseAttributeFilter(attributeQuery);
            if (parsedAttribute === undefined) {
                continue;
            }
            parsedFilters.push(parsedAttribute);
        }
        if (!parsedFilters.some((f) => !!f)) {
            return undefined;
        }
        const withNegate = (data) => {
            return negateRoot ? { ["$not"]: data } : data;
        };
        if (this._isMoreThanOneFilter(parsedFilters)) {
            return withNegate({
                [rootLogical]: parsedFilters,
            });
        }
        else {
            return withNegate(parsedFilters[0]);
        }
    }
    static _isMoreThanOneFilter(filters) {
        return filters.length > 1;
    }
    static _parsePopulate(populates, queryType = "strapiService") {
        if (!(populates === null || populates === void 0 ? void 0 : populates.some((f) => !!f))) {
            return undefined;
        }
        const isQueryEngine = this._isQueryEngine(queryType);
        let parsedPopulates = {};
        for (const populate of populates) {
            if (populate.key === "*") {
                parsedPopulates = isQueryEngine ? true : "*";
                break;
            }
            const isComplex = Index._isPopulateComplex(populate);
            if (isComplex) {
                const nestedQuery = populate.nestedQuery;
                const isDefaultQuery = this._isDefaultQueryPopulation(nestedQuery);
                if (isDefaultQuery) {
                    Object.assign(parsedPopulates, {
                        [populate.key]: Index._buildQuery(nestedQuery, queryType),
                    });
                }
                else {
                    const morphQuery = {};
                    Object.entries(nestedQuery).forEach(([key, query]) => {
                        const parsedQuery = Index._buildQuery(query, queryType);
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
            }
            else {
                Object.assign(parsedPopulates, { [populate.key]: true });
            }
        }
        return parsedPopulates;
    }
    static _isPopulateComplex(populate) {
        return populate.nestedQuery !== undefined;
    }
}
/**
 * Utils for obj and arrays
 */
function _set(obj = {}, path, value) {
    const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);
    pathArray.reduce((acc, key, i) => {
        if (acc[key] === undefined)
            acc[key] = {};
        if (i === pathArray.length - 1)
            acc[key] = value;
        return acc[key];
    }, obj);
    return obj;
}
function _union(arr, ...args) {
    return [...new Set(arr.concat(...args))];
}
function _unionBy(...arrays) {
    const iteratee = arrays.pop();
    if (Array.isArray(iteratee)) {
        return [];
    }
    return [...arrays].flat().filter(((set) => (o) => set.has(iteratee(o)) ? false : set.add(iteratee(o)))(new Set()));
}
