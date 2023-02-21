"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.SQBuilder = void 0;
var lodash_1 = require("lodash");
var SQBuilder = /** @class */ (function () {
    function SQBuilder(builderConfig) {
        this._query = {
            sort: [],
            filters: {
                rootLogical: "$and",
                attributeFilters: []
            },
            population: [],
            fields: []
        };
        this._builderConfig = {
            defaultSort: "asc"
        };
        this._nextAttributeNegate = false;
        this._isReadonly = false;
        if (builderConfig) {
            this._builderConfig = __assign(__assign({}, this._builderConfig), builderConfig);
        }
    }
    //<editor-fold desc="Build functions">
    /**
     * @description Build Strapi query
     * @param {QueryTypes} queryType Default StrapiService
     * @return {StrapiEntityQuery} Composed query
     */
    SQBuilder.prototype.build = function (queryType) {
        if (queryType === void 0) { queryType = "strapiService"; }
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
    };
    /**
     * @description Build Strapi query for Strapi service
     * @return {StrapiEntityQuery} Composed query
     */
    SQBuilder.prototype.buildStrapiService = function () {
        return SQBuilder._buildQuery(this._query, "strapiService");
    };
    /**
     * @description Build Strapi query for Entity service
     * @return {StrapiEntityQuery} Composed query
     */
    SQBuilder.prototype.buildEntityService = function () {
        return SQBuilder._buildQuery(this._query, "entityService");
    };
    /**
     * @description Build Strapi query for Query service
     * @return {StrapiEntityQuery} Composed query
     */
    SQBuilder.prototype.buildQueryEngine = function () {
        return SQBuilder._buildQuery(this._query, "queryEngine");
    };
    //</editor-fold>
    //<editor-fold desc="Filters functions">
    /**
     * @description Filter query
     * @description If filterInput is empty or callback builder wait for logical filtration if key input builder wait for attribute filters
     * @param {FilterInputCallback| FilterKey} filterInput Can be key or callback with same builder for visual filter grouping
     * @param {FilterInputCallback} thisCallback Provides same builder to group filters function calls
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.filters = function (filterInput, thisCallback) {
        if (this._isReadonly) {
            return this;
        }
        if (typeof filterInput === "function") {
            filterInput(this);
            return this;
        }
        if (filterInput !== undefined) {
            this._prevFilterKey = filterInput;
        }
        if (thisCallback !== undefined && typeof thisCallback === "function") {
            thisCallback(this);
            return this;
        }
        return this;
    };
    /**
     * Add deep nested filters to current filter - this function provide new builder to callback
     * @param nestedCallback
     */
    SQBuilder.prototype["with"] = function (nestedCallback) {
        var _this = this;
        if (this._isReadonly) {
            return this;
        }
        var nestedBuilder = new SQBuilder();
        nestedCallback(nestedBuilder);
        this._addToFilter({
            key: this._prevFilterKey,
            nested: nestedBuilder.getRawFilters()
        }, function () {
            _this._prevFilterKey = undefined;
        });
        return this;
    };
    //<editor-fold desc="Logical filters">
    /**
     * @description Negates current attribute or logical filter
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.not = function () {
        if (this._isReadonly) {
            return this;
        }
        var target = this._prevFilterKey !== undefined ? "attribute" : "negateRoot";
        target === "negateRoot"
            ? (this._query.filters.negate = true)
            : (this._nextAttributeNegate = true);
        return this;
    };
    /**
     * @description Add logical OR filter.
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.or = function () {
        if (this._isReadonly) {
            return this;
        }
        this._query.filters.rootLogical = "$or";
        return this;
    };
    /**
     * @description Add logical AND filter.
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.and = function () {
        if (this._isReadonly) {
            return this;
        }
        this._query.filters.rootLogical = "$and";
        return this;
    };
    //</editor-fold>
    //<editor-fold desc="Attributes filters">
    /**
     * @description Add "Equal" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.eq = function (value) {
        return this._addAttribute("$eq", value);
    };
    /**
     * @description Add "Equal insensitive" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.eqi = function (value) {
        return this._addAttribute("$eqi", value);
    };
    /**
     * @description Add "Not Equal" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.ne = function (value) {
        return this._addAttribute("$ne", value);
    };
    /**
     * @description Add "In" attribute filter
     * @param {MultipleAttributeType} value
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype["in"] = function (value) {
        return this._addAttribute("$in", value);
    };
    /**
     * @description Add "Not In" attribute filter
     * @param {MultipleAttributeType} value
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.notIn = function (value) {
        return this._addAttribute("$notIn", value);
    };
    /**
     * @description Add "Less Than" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.lt = function (value) {
        return this._addAttribute("$lt", value);
    };
    /**
     * @description Add "Less Than or Equal" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.lte = function (value) {
        return this._addAttribute("$lte", value);
    };
    /**
     * @description Add "Greater Than" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.gt = function (value) {
        return this._addAttribute("$gt", value);
    };
    /**
     * @description Add "Greater Than or Equal" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.gte = function (value) {
        return this._addAttribute("$gte", value);
    };
    /**
     * @description Add "Contains" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.contains = function (value) {
        return this._addAttribute("$contains", value);
    };
    /**
     * @description Add "Not Contains" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.notContains = function (value) {
        return this._addAttribute("$notContains", value);
    };
    /**
     * @description Add "Contains case-insensitive" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.containsi = function (value) {
        return this._addAttribute("$containsi", value);
    };
    /**
     * @description Add "Not Contains case-insensitive" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.notContainsi = function (value) {
        return this._addAttribute("$notContainsi", value);
    };
    /**
     * @description Add "Start with" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.startsWith = function (value) {
        return this._addAttribute("$startsWith", value);
    };
    /**
     * @description Add "Ends with" attribute filter
     * @param {SingleAttributeType} value
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.endsWith = function (value) {
        return this._addAttribute("$endsWith", value);
    };
    /**
     * @description Add "Is null" attribute filter
     * @param {boolean} value
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype["null"] = function (value) {
        return this._addAttribute("$null", value);
    };
    /**
     * @description Add "Is not null" attribute filter
     * @param {boolean} value
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.notNull = function (value) {
        return this._addAttribute("$notNull", value);
    };
    /**
     * @description Add "Between" attribute filter
     * @param {MultipleAttributeType} value
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.between = function (value) {
        return this._addAttribute("$between", value);
    };
    //</editor-fold> filt
    //<editor-fold desc="Filter private actions">
    SQBuilder.prototype._addAttribute = function (type, value) {
        var _this = this;
        if (this._isReadonly) {
            return this;
        }
        if (this._prevFilterKey !== undefined) {
            this._addToFilter({
                key: this._prevFilterKey,
                type: type,
                value: value,
                negate: this._nextAttributeNegate
            }, function () {
                _this._prevFilterKey = undefined;
                _this._nextAttributeNegate = false;
            });
        }
        return this;
    };
    SQBuilder.prototype._addToFilter = function (filter, onAdded) {
        this._query.filters.attributeFilters.push(filter);
        onAdded && onAdded();
    };
    //</editor-fold>
    //</editor-fold>
    //<editor-fold desc="Population">
    /**
     * @description Populate query can be simple populate or complex nested populate with builder callback
     * @param {StrapiPopulationInputQuery} populateQuery
     * @param {PopulationInputCallback} nestedCallback Provides callback with new builder for nested filtering, sorting and fields selection
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.populate = function (populateQuery, nestedCallback) {
        if (this._isReadonly) {
            return this;
        }
        var nestedBuilder = undefined;
        var parsedPopulateQuery = SQBuilder._parsePopulation(populateQuery);
        var singlePopulateQuery = parsedPopulateQuery[0];
        if (nestedCallback !== undefined && typeof nestedCallback === "function") {
            nestedBuilder = new SQBuilder({
                defaultSort: this._builderConfig.defaultSort
            });
            nestedBuilder.setPrevPopulationKey(singlePopulateQuery.key);
            nestedCallback(nestedBuilder);
        }
        if (nestedBuilder) {
            var findMorph = nestedBuilder.getPopulationByKey(singlePopulateQuery.key);
            var isMorphData = findMorph !== undefined &&
                !SQBuilder._isDefaultQueryPopulation(findMorph.nestedQuery);
            parsedPopulateQuery[0] = {
                key: singlePopulateQuery.key,
                nestedQuery: isMorphData
                    ? findMorph.nestedQuery
                    : {
                        fields: nestedBuilder.getRawFields(),
                        population: nestedBuilder.getRawPopulation(),
                        sort: nestedBuilder.getRawSort(),
                        filters: nestedBuilder.getRawFilters()
                    }
            };
        }
        for (var _i = 0, parsedPopulateQuery_1 = parsedPopulateQuery; _i < parsedPopulateQuery_1.length; _i++) {
            var population = parsedPopulateQuery_1[_i];
            this._addToPopulate(population);
        }
        return this;
    };
    /**
     * @description Add populate fragments for dynamic zones
     * @param {string} componentTypeKey Component type key
     * @param {PopulationInputCallback} nestedCallback Component Builder
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.on = function (componentTypeKey, nestedCallback) {
        var _a;
        var _this = this;
        if (this._isReadonly) {
            return this;
        }
        if (this._prevPopulateKey === undefined) {
            return this;
        }
        var populationIndex = (0, lodash_1.findIndex)(this._query.population, function (p) { return p.key === _this._prevPopulateKey; });
        var nestedBuilder = new SQBuilder({
            defaultSort: this._builderConfig.defaultSort
        });
        nestedCallback(nestedBuilder);
        var newQuery = {};
        (0, lodash_1.assign)(newQuery, (_a = {},
            _a[componentTypeKey] = {
                fields: nestedBuilder.getRawFields(),
                population: nestedBuilder.getRawPopulation(),
                sort: nestedBuilder.getRawSort(),
                filters: nestedBuilder.getRawFilters()
            },
            _a));
        if (populationIndex === -1) {
            this._query.population.push({
                key: this._prevPopulateKey,
                nestedQuery: newQuery
            });
        }
        else {
            var populationQuery = this._query.population[populationIndex];
            this._query.population[populationIndex] = {
                key: this._prevPopulateKey,
                nestedQuery: __assign(__assign({}, populationQuery.nestedQuery), newQuery)
            };
        }
        return this;
    };
    SQBuilder.prototype._addToPopulate = function (populate) {
        if (populate.key === "*") {
            this._query.population = [{ key: populate.key }];
            return;
        }
        var founded = (0, lodash_1.findIndex)(this._query.population, function (f) {
            return f.key === populate.key;
        });
        if (founded === -1) {
            this._query.population.push(populate);
        }
        else {
            this._query.population[founded] = populate;
        }
    };
    SQBuilder._parsePopulation = function (populationQuery) {
        if (populationQuery === "*") {
            return [{ key: "*" }];
        }
        if (this._isArrayOfPopKeys(populationQuery)) {
            return populationQuery.map(function (s) { return ({ key: s }); });
        }
        if (this._isNotArrayOfPopKeys(populationQuery)) {
            return [{ key: populationQuery }];
        }
    };
    SQBuilder._isNotArrayOfPopKeys = function (query) {
        return !Array.isArray(query);
    };
    SQBuilder._isArrayOfPopKeys = function (query) {
        return Array.isArray(query);
    };
    SQBuilder._isDefaultQueryPopulation = function (query) {
        return ("sort" in query ||
            "filters" in query ||
            "population" in query ||
            "fields" in query);
    };
    //</editor-fold>
    //<editor-fold desc="Fields">
    /**
     * @description Select model fields
     * @description Same keys will be merged
     * @param {StrapiFieldsInputQuery} fields
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.fields = function (fields) {
        if (this._isReadonly) {
            return this;
        }
        var nowFields = this._query.fields;
        this._query.fields = (0, lodash_1.union)(nowFields, Array.isArray(fields) ? fields : [fields]);
        return this;
    };
    //</editor-fold>
    //<editor-fold desc="Sort">
    /**
     * @description Add sorting
     * @description Same keys will be merged
     * @param {StrapiSortInputQuery} sortQuery
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.sort = function (sortQuery) {
        if (this._isReadonly) {
            return this;
        }
        var nowSortValue = this._query.sort;
        var parsedSortQuery = SQBuilder._parseSortObject(sortQuery, this._builderConfig.defaultSort);
        this._query.sort = (0, lodash_1.unionBy)(Array.isArray(nowSortValue) ? nowSortValue : [nowSortValue], Array.isArray(parsedSortQuery) ? parsedSortQuery : [parsedSortQuery], function (v) { return v.key; });
        return this;
    };
    SQBuilder._createSortObject = function (stringKey, defaultSort) {
        return { key: stringKey, type: defaultSort };
    };
    SQBuilder._createSortObjectArray = function (stringArray, defaultSort) {
        return stringArray.map(function (s) { return SQBuilder._createSortObject(s, defaultSort); });
    };
    SQBuilder._parseSortObject = function (sortQuery, defaultSort) {
        if (this._isSortArray(sortQuery)) {
            if (this._isArrayOfKeys(sortQuery)) {
                return SQBuilder._createSortObjectArray(sortQuery, defaultSort);
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
                return SQBuilder._createSortObject(sortQuery, defaultSort);
            }
        }
    };
    SQBuilder._isSortObject = function (sortQuery) {
        return typeof sortQuery === "object";
    };
    SQBuilder._isSortKey = function (sortQuery) {
        return typeof sortQuery === "string";
    };
    SQBuilder._isSortArray = function (sortQuery) {
        return Array.isArray(sortQuery);
    };
    SQBuilder._isArrayOfKeys = function (sortQuery
    // @ts-ignore
    ) {
        var _this = this;
        return (this._isSortArray(sortQuery) &&
            sortQuery.every(function (s) { return !!_this._isSortKey(s); }));
    };
    //</editor-fold>
    // <editor-fold desc="Pagination">
    /**
     * @description Add StrapiService pagination
     * @param {number} page
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.page = function (page) {
        if (this._isReadonly) {
            return this;
        }
        this._query.pagination = __assign(__assign({}, this._query.pagination), { page: page });
        return this;
    };
    SQBuilder.prototype.pageSize = function (pageSize) {
        if (this._isReadonly) {
            return this;
        }
        this._query.pagination = __assign(__assign({}, this._query.pagination), { pageSize: pageSize });
        return this;
    };
    SQBuilder.prototype.pageStart = function (start) {
        if (this._isReadonly) {
            return this;
        }
        this._query.offsetPagination = __assign(__assign({}, this._query.offsetPagination), { start: start });
        return this;
    };
    SQBuilder.prototype.pageLimit = function (limit) {
        if (this._isReadonly) {
            return this;
        }
        this._query.offsetPagination = __assign(__assign({}, this._query.offsetPagination), { limit: limit });
        return this;
    };
    // </editor-fold>
    // <editor-fold desc="Data">
    /**
     * @description Add Any input data to query
     * @param {object} dataObject
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.data = function (dataObject) {
        if (this._isReadonly) {
            return this;
        }
        this._query.data = dataObject;
        return this;
    };
    // </editor-fold>
    // <editor-fold desc="Raw query utils">
    /**
     * @description Create builder readonly that all filter methods don't change query state
     * @param {boolean} isReadonly
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.readonly = function (isReadonly) {
        this._isReadonly = isReadonly === undefined ? true : isReadonly;
        return this;
    };
    /**
     * @description Get raw filters info
     * @return {StrapiRawFilters} Parsed filters
     */
    SQBuilder.prototype.getRawFilters = function () {
        return this._query.filters;
    };
    /**
     * @description Get fields selection data
     * @return {StrapiFields} Parsed fields data
     */
    SQBuilder.prototype.getRawFields = function () {
        return this._query.fields;
    };
    /**
     * @description Get raw sort data
     * @return {StrapiSort[]} Parsed sort data
     */
    SQBuilder.prototype.getRawSort = function () {
        return this._query.sort;
    };
    /**
     * @description Get population data
     * @return {StrapiPopulation} Parsed population data
     */
    SQBuilder.prototype.getRawPopulation = function () {
        return this._query.population;
    };
    /**
     * @description Get full raw query
     * @return {QueryRawInfo} Parsed population data
     */
    SQBuilder.prototype.getRawQuery = function () {
        return this._query;
    };
    /**
     * @description Get raw sort data
     * @return {pagination?: StrapiPagination, offsetPagination?: StrapiOffsetPagination} Parsed sort data
     */
    SQBuilder.prototype.getRawPagination = function () {
        return {
            pagination: this._query.pagination,
            offsetPagination: this._query.offsetPagination
        };
    };
    /**
     * @description Set builder prev population key
     * @description
     */
    SQBuilder.prototype.setPrevPopulationKey = function (populationKey) {
        this._prevPopulateKey = populationKey;
    };
    /**
     * @description Get population by key
     * @param {PopulationKey} populationKey
     * @return {StrapiPopulation | undefined} Population object
     */
    SQBuilder.prototype.getPopulationByKey = function (populationKey) {
        return this._query.population.find(function (p) { return p.key === populationKey; });
    };
    // </editor-fold>
    //<editor-fold desc="Merge utils">
    /**
     * @description Merge external builder pagination
     * @param {SQBuilder} builder External builder
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.joinPagination = function (builder) {
        if (this._isReadonly) {
            return this;
        }
        var externalPagination = builder.getRawPagination();
        this._query.pagination = externalPagination.pagination;
        this._query.offsetPagination = externalPagination.offsetPagination;
        return this;
    };
    /**
     * @description Merge external builder population
     * @param {SQBuilder} builder External builder
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.joinPopulation = function (builder) {
        if (this._isReadonly) {
            return this;
        }
        var externalPopulation = builder.getRawPopulation();
        this._query.population = (0, lodash_1.unionBy)(this._query.population, externalPopulation, function (p) { return p.key; });
        return this;
    };
    /**
     * @description Merge external builder filters
     * @param {SQBuilder} builder External builder
     * @param {boolean} mergeRootLogical If true on first level merged filter override root logical if used with its add root logical to nested builder not this
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.joinFilters = function (builder, mergeRootLogical) {
        if (mergeRootLogical === void 0) { mergeRootLogical = false; }
        if (this._isReadonly) {
            return this;
        }
        var externalFilters = builder.getRawFilters();
        this._query.filters.attributeFilters =
            this._query.filters.attributeFilters.concat(externalFilters.attributeFilters);
        this._query.filters.negate = externalFilters.negate;
        if (mergeRootLogical) {
            this._query.filters.rootLogical = externalFilters.rootLogical;
        }
        return this;
    };
    /**
     * @description Merge external builder sorts
     * @param {SQBuilder} builder External builder
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.joinSort = function (builder) {
        if (this._isReadonly) {
            return this;
        }
        var externalSort = builder.getRawSort();
        this._query.sort = (0, lodash_1.unionBy)(this._query.sort, externalSort, function (s) { return s.key; });
        return this;
    };
    /**
     * @description Merge external builder fields
     * @param {SQBuilder} builder External builder
     * @return {SQBuilder} This builder
     */
    SQBuilder.prototype.joinFields = function (builder) {
        if (this._isReadonly) {
            return this;
        }
        var externalFields = builder.getRawFields();
        this._query.fields = (0, lodash_1.union)(this._query.fields, externalFields);
        return this;
    };
    //</editor-fold>
    // <editor-fold desc="Query parsing utils">
    SQBuilder._buildQuery = function (rawQuery, queryType) {
        var _a;
        if (queryType === void 0) { queryType = "strapiService"; }
        var isQueryEngine = this._isQueryEngine(queryType);
        var parsedQuery = {};
        // Parsed sort values the same in service, entity service and query engine
        var sort = SQBuilder._parseSort(rawQuery.sort);
        if (sort !== undefined) {
            parsedQuery[isQueryEngine ? "orderBy" : "sort"] = sort;
        }
        // Fields values the same in service, entity service and query engine
        if ((_a = rawQuery === null || rawQuery === void 0 ? void 0 : rawQuery.fields) === null || _a === void 0 ? void 0 : _a.some(function (f) { return !!f; })) {
            parsedQuery[isQueryEngine ? "select" : "fields"] = rawQuery.fields;
        }
        // Filter values the same in service, entity service and query engine
        var filters = SQBuilder._parseFilters(rawQuery.filters);
        if (filters !== undefined) {
            parsedQuery[isQueryEngine ? "where" : "filters"] = filters;
        }
        // Populate calls build for nested query
        var populate = SQBuilder._parsePopulate(rawQuery.population, queryType);
        if (populate !== undefined) {
            parsedQuery.populate = populate;
        }
        // Pagination for strapi service, entity service and query engine is different
        var pagination = this._parsePagination(queryType, rawQuery.pagination, rawQuery.offsetPagination);
        if (pagination !== undefined) {
            parsedQuery.pagination = pagination;
        }
        // Data pass without any mods
        if ((rawQuery === null || rawQuery === void 0 ? void 0 : rawQuery.data) !== undefined) {
            parsedQuery.data = rawQuery.data;
        }
        return parsedQuery;
    };
    SQBuilder._isQueryEngine = function (queryType) {
        return queryType === "queryEngine";
    };
    SQBuilder._parsePagination = function (queryType, pagination, offsetPagination) {
        if (offsetPagination !== undefined) {
            return offsetPagination;
        }
        if (pagination !== undefined && queryType !== "queryEngine") {
            return pagination;
        }
    };
    SQBuilder._parseSort = function (sorts) {
        var sortQuery = undefined;
        if (sorts === null || sorts === void 0 ? void 0 : sorts.some(function (s) { return !!s; })) {
            var isOneSort = sorts.length === 1;
            if (isOneSort) {
                var firstSort = sorts[0];
                sortQuery = (0, lodash_1.set)({}, firstSort.key, firstSort.type);
            }
            else {
                sortQuery = [];
                for (var _i = 0, sorts_1 = sorts; _i < sorts_1.length; _i++) {
                    var sort = sorts_1[_i];
                    sortQuery.push((0, lodash_1.set)({}, sort.key, sort.type));
                }
            }
        }
        return sortQuery;
    };
    SQBuilder._parseAttributeFilter = function (filter) {
        var _a, _b, _c;
        if (filter.nested !== undefined) {
            var nestedFilters = this._parseFilters(filter.nested);
            if (nestedFilters === undefined) {
                return undefined;
            }
            return filter.key === undefined
                ? nestedFilters
                : (0, lodash_1.set)({}, filter.key, nestedFilters);
        }
        if (filter.value === undefined || filter.type === undefined) {
            return undefined;
        }
        return filter.negate
            ? (0, lodash_1.set)({}, filter.key, (_a = {},
                _a["$not"] = (_b = {},
                    _b[filter.type] = filter.value,
                    _b),
                _a))
            : (0, lodash_1.set)({}, filter.key, (_c = {},
                _c[filter.type] = filter.value,
                _c));
    };
    SQBuilder._parseFilters = function (rawFilters) {
        var _a;
        var attributeFilters = (rawFilters === null || rawFilters === void 0 ? void 0 : rawFilters.attributeFilters) || [];
        var rootLogical = (rawFilters === null || rawFilters === void 0 ? void 0 : rawFilters.rootLogical) || "$and";
        var negateRoot = (rawFilters === null || rawFilters === void 0 ? void 0 : rawFilters.negate) || false;
        var parsedFilters = [];
        for (var _i = 0, attributeFilters_1 = attributeFilters; _i < attributeFilters_1.length; _i++) {
            var attributeQuery = attributeFilters_1[_i];
            var parsedAttribute = SQBuilder._parseAttributeFilter(attributeQuery);
            if (parsedAttribute === undefined) {
                continue;
            }
            parsedFilters.push(parsedAttribute);
        }
        if (!parsedFilters.some(function (f) { return !!f; })) {
            return undefined;
        }
        var withNegate = function (data) {
            var _a;
            return negateRoot ? (_a = {}, _a["not"] = data, _a) : data;
        };
        if (this._isMoreThanOneFilter(parsedFilters)) {
            return withNegate((_a = {},
                _a[rootLogical] = parsedFilters,
                _a));
        }
        else {
            return withNegate(parsedFilters[0]);
        }
    };
    SQBuilder._isMoreThanOneFilter = function (filters) {
        return filters.length > 1;
    };
    SQBuilder._parsePopulate = function (populates, queryType) {
        if (queryType === void 0) { queryType = "strapiService"; }
        if (!(populates === null || populates === void 0 ? void 0 : populates.some(function (f) { return !!f; }))) {
            return undefined;
        }
        var isQueryEngine = this._isQueryEngine(queryType);
        var parsedPopulates = {};
        var _loop_1 = function (populate) {
            var _a, _b, _c;
            if (populate.key === "*") {
                parsedPopulates = isQueryEngine ? true : "*";
                return "break";
            }
            var isComplex = SQBuilder._isPopulateComplex(populate);
            if (isComplex) {
                var nestedQuery = populate.nestedQuery;
                var isDefaultQuery = this_1._isDefaultQueryPopulation(nestedQuery);
                if (isDefaultQuery) {
                    (0, lodash_1.assign)(parsedPopulates, (_a = {},
                        _a[populate.key] = SQBuilder._buildQuery(nestedQuery, queryType),
                        _a));
                }
                else {
                    var morphQuery_1 = {};
                    Object.entries(nestedQuery).forEach(function (_a) {
                        var _b;
                        var key = _a[0], query = _a[1];
                        var parsedQuery = SQBuilder._buildQuery(query, queryType);
                        if (Object.keys(parsedQuery).length > 0) {
                            (0, lodash_1.assign)(morphQuery_1, (_b = {},
                                _b[key] = parsedQuery,
                                _b));
                        }
                    });
                    (0, lodash_1.assign)(parsedPopulates, (_b = {},
                        _b[populate.key] = { on: morphQuery_1 },
                        _b));
                }
            }
            else {
                (0, lodash_1.assign)(parsedPopulates, (_c = {}, _c[populate.key] = true, _c));
            }
        };
        var this_1 = this;
        for (var _i = 0, populates_1 = populates; _i < populates_1.length; _i++) {
            var populate = populates_1[_i];
            var state_1 = _loop_1(populate);
            if (state_1 === "break")
                break;
        }
        return parsedPopulates;
    };
    SQBuilder._isPopulateComplex = function (populate) {
        return populate.nestedQuery !== undefined;
    };
    return SQBuilder;
}());
exports.SQBuilder = SQBuilder;
