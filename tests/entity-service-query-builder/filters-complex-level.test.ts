import { EQBuilder } from "../../lib/cjs";

describe("Filters operator", () => {
  it("should create nested filters without attribute", () => {
    const builtQuery = new EQBuilder()
      .and()
      .filterDeep(() =>
        new EQBuilder().or().lte("createdAt", "date1").gte("createdAt", "date2")
      )
      .filterDeep(() =>
        new EQBuilder().or().lte("createdAt", "date1").gte("createdAt", "date2")
      )
      .build();

    expect(builtQuery).toEqual(doubleNestedOrInRootAnd);
  });

  it("should create nested filters with attribute", () => {
    const builtQuery = new EQBuilder()
      .and()
      .filterRelation("attribute1", () =>
        new EQBuilder().or().lte("createdAt", "date1").gte("createdAt", "date2")
      )
      .filterRelation("attribute2", () => {
        return new EQBuilder()
          .or()
          .lte("createdAt", "date1")
          .gte("createdAt", "date2");
      })
      .build();

    expect(builtQuery).toEqual(doubleNestedWithAttributes);
  });

  it("should create complex query", () => {
    const builtQuery = new EQBuilder()
      .or()
      .filterRelation("attribute1", () => {
        return new EQBuilder()
          .or()
          .lte("createdAt", "date1")
          .gte("createdAt", "date2");
      })
      .filterRelation("attribute2", () => {
        return new EQBuilder()
          .not()
          .and()
          .lte("createdAt", "date1")
          .notGte("createdAt", "date2")
          .filterDeep(() => {
            return new EQBuilder()
              .or()
              .eq("deep1", "some")
              .filterNot("deep1", "$contains", "some-other");
          });
      })
      .filterDeep(() => {
        return new EQBuilder()
          .or()
          .lte("createdAt", "date1")
          .notGte("createdAt", "date2")
          .filterRelation("deep2", () => {
            return new EQBuilder()
              .eq("some2", "some")
              .between("some3", ["a", "b"]);
          });
      })
      .filterDeep(() =>
        // Try to create illegal operators on nested filter operator
        new EQBuilder()
          .or()
          .lte("createdAt", "date1")
          .gte("createdAt", "date2")
          .page(1, 26)
          .populateAll()
          .fields(["some"])
          .sortsAsc(["some"])
      )
      .build();

    expect(builtQuery).toEqual(complexAsHellQuery);
  });
});

const doubleNestedOrInRootAnd = {
  filters: {
    $and: [
      {
        $or: [
          {
            createdAt: {
              $lte: "date1",
            },
          },
          {
            createdAt: {
              $gte: "date2",
            },
          },
        ],
      },
      {
        $or: [
          {
            createdAt: {
              $lte: "date1",
            },
          },
          {
            createdAt: {
              $gte: "date2",
            },
          },
        ],
      },
    ],
  },
};

const doubleNestedWithAttributes = {
  filters: {
    $and: [
      {
        attribute1: {
          $or: [
            {
              createdAt: {
                $lte: "date1",
              },
            },
            {
              createdAt: {
                $gte: "date2",
              },
            },
          ],
        },
      },
      {
        attribute2: {
          $or: [
            {
              createdAt: {
                $lte: "date1",
              },
            },
            {
              createdAt: {
                $gte: "date2",
              },
            },
          ],
        },
      },
    ],
  },
};

const complexAsHellQuery = {
  filters: {
    $or: [
      {
        attribute1: {
          $or: [
            {
              createdAt: {
                $lte: "date1",
              },
            },
            {
              createdAt: {
                $gte: "date2",
              },
            },
          ],
        },
      },
      {
        attribute2: {
          $not: {
            $and: [
              {
                createdAt: {
                  $lte: "date1",
                },
              },
              {
                createdAt: {
                  $not: {
                    $gte: "date2",
                  },
                },
              },
              {
                $or: [
                  {
                    deep1: {
                      $eq: "some",
                    },
                  },
                  {
                    deep1: {
                      $not: {
                        $contains: "some-other",
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
      },
      {
        $or: [
          {
            createdAt: {
              $lte: "date1",
            },
          },
          {
            createdAt: {
              $not: {
                $gte: "date2",
              },
            },
          },
          {
            deep2: {
              $and: [
                {
                  some2: {
                    $eq: "some",
                  },
                },
                {
                  some3: {
                    $between: ["a", "b"],
                  },
                },
              ],
            },
          },
        ],
      },
      {
        $or: [
          {
            createdAt: {
              $lte: "date1",
            },
          },
          {
            createdAt: {
              $gte: "date2",
            },
          },
        ],
      },
    ],
  },
};
