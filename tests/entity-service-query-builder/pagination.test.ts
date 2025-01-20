import { EQBuilder } from "../../lib/cjs";

const page = 2;
const size = 24;

const offsetPaginationFull = {
  pagination: { start: page, limit: size },
};
const offsetEntityQueryEngine = { pagination: { start: page, limit: size } };

const paginationEntityQueryEngine = {
  pagination: { page: page, pageSize: size },
};

describe("Pagination operator", () => {
  // TODO: Uncomment when strapi service will return.
  // it("should create offset pagination for strapi service", () => {
  //   const queryBuilder = new EQBuilder().pageLimit(page, size);
  //   const service = queryBuilder.build();
  //
  //   expect(service).toEqual(offsetPaginationFull);
  // });

  it("should create offset pagination for query/entity service", () => {
    const queryBuilder = new EQBuilder().pageLimit(page, size);
    const query = queryBuilder.build();

    expect(query).toEqual(offsetEntityQueryEngine.pagination);
  });

  // TODO: Uncomment when strapi service will return.
  // it("should create page pagination for strapi service", () => {
  //   const queryBuilder = new SQBuilder().page(page, true).pageSize(size);
  //   const service = queryBuilder.buildStrapiService();
  //
  //   expect(service).toEqual(paginationPageFull);
  // });

  it("should create page pagination for entity service", () => {
    const queryBuilder = new EQBuilder().page(page, size);

    const entity = queryBuilder.build();

    expect(entity).toEqual(paginationEntityQueryEngine.pagination);
  });

  // TODO: Uncomment when strapi service will return.
  // it("Pagination - join", () => {
  //   const query = new EQBuilder().page(page, size)
  //
  //   const builtQuery = new SQBuilder()
  //     .pageSize(size)
  //     .joinPagination(query)
  //     .buildStrapiService();
  //
  //   const entityService = new SQBuilder()
  //     .pageSize(size)
  //     .joinPagination(query)
  //     .buildEntityService();
  //
  //   const queryEngine = new SQBuilder()
  //     .pageSize(size)
  //     .joinPagination(query)
  //     .buildQueryEngine();
  //
  //   expect(builtQuery).toEqual(paginationPageFull);
  //   expect(entityService).toEqual(paginationEntityQueryEngine.pagination);
  //   expect(queryEngine).toEqual({});
  // });
});
