import SQBuilder from "../lib/cjs";

const strapiService = {
  filters: {
    attribute: {
      $eq: "attribute",
    },
  },
  sort: { attribute: "asc" },
  populate: {
    attribute: {
      filters: {
        attribute: {
          $eq: "attribute",
        },
      },
    },
  },
  fields: ["attribute"],
  publicationState: "preview",
  locale: "uk",
  pagination: {
    page: 5,
  },
};

const { publicationState, locale, ...entityService } = strapiService;

const queryEngine = {
  where: {
    attribute: {
      $eq: "attribute",
    },
  },
  orderBy: { attribute: "asc" },
  populate: {
    attribute: {
      where: {
        attribute: {
          $eq: "attribute",
        },
      },
    },
  },
  select: ["attribute"],
  pagination: {
    start: 5,
  },
};

describe("Build types", () => {
  it("Several types - one query", () => {
    const query = new SQBuilder()
      .sort("attribute")
      .asc()
      .fields("attribute")
      .filters("attribute", (b) => b.eq("attribute"))
      .populate("attribute", (b) => b.filters("attribute").eq("attribute"))
      .publicationState("preview")
      .locale("uk");

    const serviceBuilt = query.page(5).buildStrapiService();
    const entityServiceBuilt = query.page(5).buildEntityService();
    const queryEngineBuilt = query.pageStart(5).buildQueryEngine();

    expect(serviceBuilt).toEqual(strapiService);
    expect(entityServiceBuilt).toEqual(entityService);
    expect(queryEngineBuilt).toEqual(queryEngine);
  });
});
