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

describe("Pagination query", () => {
  it("should create offset pagination for strapi service", () => {
    const queryBuilder = new SQBuilder().pageStart(page, true).pageLimit(size);
    const service = queryBuilder.buildStrapiService();

    expect(service).toEqual(offsetPaginationFull);
  });

  it("should create offset pagination for query/entity service", () => {
    const queryBuilder = new SQBuilder().pageStart(page, true).pageLimit(size);

    const entity = queryBuilder.buildEntityService();
    const query = queryBuilder.buildEntityService();

    expect(entity).toEqual(offsetEntityQueryEngine);
    expect(query).toEqual(offsetEntityQueryEngine);
  });

  it("should create page pagination for strapi service", () => {
    const queryBuilder = new SQBuilder().page(page, true).pageSize(size);
    const service = queryBuilder.buildStrapiService();

    expect(service).toEqual(paginationPageFull);
  });

  it("should create page pagination for query/entity service", () => {
    const queryBuilder = new SQBuilder().page(page, true).pageSize(size);

    const entity = queryBuilder.buildEntityService();
    const query = queryBuilder.buildEntityService();

    expect(entity).toEqual(paginationEntityQueryEngine);
    expect(query).toEqual(paginationEntityQueryEngine);
  });

  it("Pagination - join", () => {
    const query = new SQBuilder().page(page, true).pageSize(size);

    const builtQuery = new SQBuilder()
      .pageSize(size)
      .joinPagination(query)
      .buildStrapiService();

    expect(builtQuery).toEqual(paginationPageFull);
  });
});
