import SQBuilder from "../lib/cjs";

const strapiService = {
  filters: {
    $and: [
      {
        attribute: {
          $eq: "value",
        },
      },
      {
        nested: {
          attribute: {
            $eq: "value",
          },
        },
      },
    ],
  },
  sort: [{ attribute: "asc" }],
  populate: {
    attribute: {
      filters: {
        $and: [
          {
            attribute: {
              $eq: "value",
            },
          },
        ],
      },
    },
    dynamicZone: {
      on: {
        component: {
          fields: ["attribute"],
        },
      },
    },
  },
  fields: ["attribute"],
  publicationState: "preview",
  locale: "uk",
  pagination: {
    page: 5,
    pageSize: 24,
    withCount: true,
  },
};

const entityService = {
  filters: {
    $and: [
      {
        attribute: {
          $eq: "value",
        },
      },
      {
        nested: {
          attribute: {
            $eq: "value",
          },
        },
      },
    ],
  },
  sort: [{ attribute: "asc" }],
  populate: {
    attribute: {
      filters: {
        $and: [
          {
            attribute: {
              $eq: "value",
            },
          },
        ],
      },
    },
    dynamicZone: {
      on: {
        component: {
          fields: ["attribute"],
        },
      },
    },
  },
  fields: ["attribute"],
  publicationState: "preview",
  page: 5,
  pageSize: 24,
};

const queryEngine = {
  where: {
    $and: [
      {
        attribute: {
          $eq: "value",
        },
      },
      {
        nested: {
          attribute: {
            $eq: "value",
          },
        },
      },
    ],
  },
  orderBy: [{ attribute: "asc" }],
  populate: {
    attribute: {
      where: {
        $and: [
          {
            attribute: {
              $eq: "value",
            },
          },
        ],
      },
    },
    dynamicZone: {
      on: {
        component: {
          select: ["attribute"],
        },
      },
    },
  },
  select: ["attribute"],
  start: 5,
  limit: 24,
};

describe("Strapi query builder", () => {
  it("should build proper strapi structure of queries", () => {
    const query = new SQBuilder()
      .sort("attribute")
      .asc()
      .field("attribute")
      .filters("attribute", (b) => b.eq("value"))
      .filters("nested.attribute", (b) => b.eq("value"))
      .populate("attribute", (b) => b.filters("attribute").eq("value"))
      .populate("dynamicZone", (dynamicZoneBuilder) => {
        dynamicZoneBuilder.on("component", (b) => b.field("attribute"));
      })
      .publicationState("preview")
      .locale("uk");

    const serviceBuilt = query.page(5, true).pageSize(24).buildStrapiService();
    const entityServiceBuilt = query
      .page(5, true)
      .pageSize(24)
      .buildEntityService();
    const queryEngineBuilt = query
      .pageStart(5)
      .pageLimit(24)
      .buildQueryEngine();

    expect(serviceBuilt).toEqual(strapiService);
    expect(entityServiceBuilt).toEqual(entityService);
    expect(queryEngineBuilt).toEqual(queryEngine);
  });
});
