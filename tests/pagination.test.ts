import { SQBuilder } from "../lib/cjs";

const page = 2;
const size = 24;

const offsetPagination = { pagination: { start: page } };
const offsetPaginationLimit = { pagination: { limit: size } };
const offsetPaginationFull = { pagination: { start: page, limit: size } };

const paginationPage = { pagination: { page: page } };
const paginationSize = { pagination: { pageSize: size } };
const paginationFull = { pagination: { page: page, pageSize: size } };

describe("Pagination", () => {
  it("Offset pagination - start", () => {
    const queryBuilder = new SQBuilder().pageStart(page);

    const service = queryBuilder.buildStrapiService();
    const entityService = queryBuilder.buildEntityService();
    const queryEngine = queryBuilder.buildQueryEngine();

    expect(service).toEqual(offsetPagination);
    expect(entityService).toEqual(offsetPagination);
    expect(queryEngine).toEqual(offsetPagination);
  });

  it("Offset pagination - limit", () => {
    const queryBuilder = new SQBuilder().pageLimit(size);

    const service = queryBuilder.buildStrapiService();
    const entityService = queryBuilder.buildEntityService();
    const queryEngine = queryBuilder.buildQueryEngine();

    expect(service).toEqual(offsetPaginationLimit);
    expect(entityService).toEqual(offsetPaginationLimit);
    expect(queryEngine).toEqual(offsetPaginationLimit);
  });

  it("Offset pagination - full", () => {
    const queryBuilder = new SQBuilder().pageStart(page).pageLimit(size);

    const service = queryBuilder.buildStrapiService();
    const entityService = queryBuilder.buildEntityService();
    const queryEngine = queryBuilder.buildQueryEngine();

    expect(service).toEqual(offsetPaginationFull);
    expect(entityService).toEqual(offsetPaginationFull);
    expect(queryEngine).toEqual(offsetPaginationFull);
  });

  it("Pagination - page", () => {
    const queryBuilder = new SQBuilder().page(page);

    const service = queryBuilder.buildStrapiService();
    const entityService = queryBuilder.buildEntityService();
    const queryEngine = queryBuilder.buildQueryEngine();

    expect(service).toEqual(paginationPage);
    expect(entityService).toEqual(paginationPage);
    expect(queryEngine).toEqual({});
  });

  it("Pagination - pageSize", () => {
    const queryBuilder = new SQBuilder().pageSize(size);

    const service = queryBuilder.buildStrapiService();
    const entityService = queryBuilder.buildEntityService();
    const queryEngine = queryBuilder.buildQueryEngine();

    expect(service).toEqual(paginationSize);
    expect(entityService).toEqual(paginationSize);
    expect(queryEngine).toEqual({});
  });

  it("Pagination - full", () => {
    const queryBuilder = new SQBuilder().page(page).pageSize(size);

    const service = queryBuilder.buildStrapiService();
    const entityService = queryBuilder.buildEntityService();
    const queryEngine = queryBuilder.buildQueryEngine();

    expect(service).toEqual(paginationFull);
    expect(entityService).toEqual(paginationFull);
    expect(queryEngine).toEqual({});
  });
});
