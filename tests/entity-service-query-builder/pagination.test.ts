import { EQBuilder } from "../../lib/cjs";

const page = 2;
const size = 24;

const offsetEntityQueryEngine = { pagination: { start: page, limit: size } };

const paginationEntityQueryEngine = {
  pagination: { page: page, pageSize: size },
};

describe("Pagination operator", () => {
  it("should create offset pagination for query/entity service", () => {
    const queryBuilder = new EQBuilder().start(page).limit(size);
    const query = queryBuilder.build();

    expect(query).toEqual(offsetEntityQueryEngine.pagination);
  });

  it("should create page pagination for entity service", () => {
    const queryBuilder = new EQBuilder().page(page).pageSize(size);

    const entity = queryBuilder.build();

    expect(entity).toEqual(paginationEntityQueryEngine.pagination);
  });
});
