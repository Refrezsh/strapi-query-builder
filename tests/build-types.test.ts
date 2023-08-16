import SQBuilder from "../lib/cjs";

const strapiService = {
  filters: {
    $and: [
      {
        attribute: {
          $eq: "attribute",
        },
      },
      {
        nested: {
          attribute: {
            $eq: "attribute",
          },
        },
      },
    ],
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
    withCount: true,
  },
};

const entityService = {
  filters: {
    $and: [
      {
        attribute: {
          $eq: "attribute",
        },
      },
      {
        nested: {
          attribute: {
            $eq: "attribute",
          },
        },
      },
    ],
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
  page: 5,
};

const queryEngine = {
  where: {
    $and: [
      {
        attribute: {
          $eq: "attribute",
        },
      },
      {
        nested: {
          attribute: {
            $eq: "attribute",
          },
        },
      },
    ],
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
  start: 5,
};

describe("Strapi query build types", () => {
  it("should build strapi proper structure queries", () => {
    const query = new SQBuilder()
      .sort("attribute")
      .asc()
      .fields("attribute")
      .filters("attribute", (b) => b.eq("attribute"))
      .filters("nested.attribute", (b) => b.eq("attribute"))
      .populate("attribute", (b) => b.filters("attribute").eq("attribute"))
      .publicationState("preview")
      .locale("uk");

    const serviceBuilt = query.page(5, true).buildStrapiService();
    const entityServiceBuilt = query.page(5, true).buildEntityService();
    const queryEngineBuilt = query.pageStart(5).buildQueryEngine();

    expect(serviceBuilt).toEqual(strapiService);
    expect(entityServiceBuilt).toEqual(entityService);
    expect(queryEngineBuilt).toEqual(queryEngine);
  });
});
