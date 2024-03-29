import SQBuilder from "../lib/cjs";

describe("Filters operator", () => {
  it("should create nested filters without attribute", () => {
    const builtQuery = new SQBuilder()
      .and()
      .filters((b) =>
        b.with((nestedBuilder) =>
          nestedBuilder
            .or()
            .filters("createdAt")
            .lte("date1")
            .filters("createdAt")
            .gte("date2")
        )
      )

      .filters()
      .with((nestedBuilder) =>
        nestedBuilder
          .or()
          .filters("createdAt")
          .lte("date1")
          .filters("createdAt")
          .gte("date2")
      )
      .build();

    expect(builtQuery).toEqual(doubleNestedOrInRootAnd);
  });

  it("should create nested filters with attribute", () => {
    const builtQuery = new SQBuilder()
      .and()
      .filters("attribute1", (b) =>
        b.with((nestedBuilder) =>
          nestedBuilder
            .or()
            .filters("createdAt")
            .lte("date1")
            .filters("createdAt")
            .gte("date2")
        )
      )
      .filters("attribute2")
      .with((nestedBuilder) =>
        nestedBuilder
          .or()
          .filters("createdAt")
          .lte("date1")
          .filters("createdAt")
          .gte("date2")
      )
      .build();

    expect(builtQuery).toEqual(doubleNestedWithAttributes);
  });

  it("should create complex query", () => {
    const builtQuery = new SQBuilder()
      .or()
      .filters("attribute1")
      .with((nestedBuilder) =>
        nestedBuilder
          .or()
          .filters("createdAt")
          .lte("date1")
          .filters("createdAt")
          .gte("date2")
      )
      .filters("attribute2")
      .with((nestedBuilder) =>
        // Inlined callbacks + negation + attribute negation + deep nested without key
        nestedBuilder
          .not()
          .and()
          .filters("createdAt", (b) => b.lte("date1"))
          .filters("createdAt", (b) => b.not().gte("date2"))
          .filters()
          .with((secondNestedBuilder) => {
            secondNestedBuilder
              .or()
              .filters("deep1", (d) => d.eq("some"))
              .filters("deep1")
              .not()
              .contains("some-other");
          })
      )
      .filters()
      .with((nestedBuilder) =>
        // Creates third nested with floated eq - FLOAT EQ with another nested by attribute
        nestedBuilder
          .or()
          .filters("createdAt")
          .lte("date1")
          .filters("createdAt")
          .not()
          .gte("date2")
          .filters("deep2")
          .with((thirdNestedBuilder) => {
            thirdNestedBuilder
              .filters("some2")
              .eq("some")
              .filters("some3")
              .between(["a", "b"]);
          })
          .eq("FLOAT EQ")
      )
      .filters()
      .with((nestedBuilder) =>
        // Try to create illegal operators on nested filter operator
        nestedBuilder
          .or()
          .filters("createdAt")
          .lte("date1")
          .filters("createdAt")
          .gte("date2")
          .pageSize(1)
          .populate("*")
          .fields(["some"])
          .sort(["some"])
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
