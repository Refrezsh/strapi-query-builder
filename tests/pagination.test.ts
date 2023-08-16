import SQBuilder from "../lib/cjs";

const page = 2;
const size = 24;

const offsetPaginationFull = {
  pagination: { start: page, limit: size, withCount: true },
};
const offsetEntityQueryEngine = { pagination: { start: page, limit: size } };

const paginationPageFull = {
  pagination: { page: page, pageSize: size, withCount: true },
};
const paginationEntityQueryEngine = {
  pagination: { page: page, pageSize: size },
};

describe("Pagination operator", () => {
  it("should create offset pagination for strapi service", () => {
    const queryBuilder = new SQBuilder().pageStart(page, true).pageLimit(size);
    const service = queryBuilder.buildStrapiService();

    expect(service).toEqual(offsetPaginationFull);
  });

  it("should create offset pagination for query/entity service", () => {
    const queryBuilder = new SQBuilder().pageStart(page, true).pageLimit(size);

    const entity = queryBuilder.buildEntityService();
    const query = queryBuilder.buildQueryEngine();

    expect(entity).toEqual(offsetEntityQueryEngine.pagination);
    expect(query).toEqual(offsetEntityQueryEngine.pagination);
  });

  it("should create page pagination for strapi service", () => {
    const queryBuilder = new SQBuilder().page(page, true).pageSize(size);
    const service = queryBuilder.buildStrapiService();

    expect(service).toEqual(paginationPageFull);
  });

  it("should create page pagination for query/entity service", () => {
    const queryBuilder = new SQBuilder().page(page, true).pageSize(size);

    const entity = queryBuilder.buildEntityService();
    const query = queryBuilder.buildQueryEngine();

    expect(entity).toEqual(paginationEntityQueryEngine.pagination);
    expect(query).toEqual({});
  });

  it("Pagination - join", () => {
    const query = new SQBuilder().page(page, true).pageSize(size);

    const builtQuery = new SQBuilder()
      .pageSize(size)
      .joinPagination(query)
      .buildStrapiService();

    const entityService = new SQBuilder()
      .pageSize(size)
      .joinPagination(query)
      .buildEntityService();

    const queryEngine = new SQBuilder()
      .pageSize(size)
      .joinPagination(query)
      .buildQueryEngine();

    expect(builtQuery).toEqual(paginationPageFull);
    expect(entityService).toEqual(paginationEntityQueryEngine.pagination);
    expect(queryEngine).toEqual({});
  });
});
