# Migration from SQBuilder v1 to v4

`SQBuilder` was developed back when Strapi didn't have Typescript support.
But there came a point when Strapi first started supporting Typescript, then generating types, and then Entity Service methods learned to check queries and generate the correct output type.

Main list of changes.

- Builder now returns the correct query type to be compatible with Strapi Entity Service | Query Engine typing.
- The builder syntax has become more explicit and simpler.
- For each service its own builder.

## Import

```ts
// Before
import SQBuilder from "strapi-query-builder";

// Afeter
import { SQBuilder, QQBuilder, RQBuilder } from "strapi-query-builder";
```

## Filters

### Attribute filters

Before it was `filters(“attribute).eq(”value“)`, now it is `eq(”attribute“, ‘value’)` or `filter(”attribute”, ‘$eq’, ‘value’)`.
Callbacks are now only used for deep populate or deep filtering.

```ts
// Before
const queryV1 = new SQBuilder().filters("title").eq("Hello World").build();

// After
const queryV4 = new SQBuilder().eq("title", "Hello World").build();
```

### Root Logical

Root Logical work the same way as before, except `not`.
`not` now works only at the root logical level. Attribute negation is now just as static and simpler.

```ts
// Before
const queryV1 = new SQBuilder()
  .filters("title", (b) => b.not().eq("one"))
  .build();

// After
const queryV4 = new SQBuilder().notEq("title", "one").build(); // No more callback, not() now works with one sense.
```

### Deep Filtering

`.filters` `.with` has been split into two explicit operators.

- `.filterDeep` for deep filtering for the current model.
- `.filterRelation` for deep filtering for related models.
- Callback changed its signature from `(builder) => void` to `() => new builder()`

```ts
// Before
const queryV1 = new SQBuilder().filters((b) =>
  b
    .with((nestedBuilder) =>
      nestedBuilder
        .or()
        .filters("createdAt", (b) => b.lte("date1"))
        .filters("createdAt", (b) => b.gte("date2"))
    )
    .build()
);

// After
const queryV4 = new SQBuilder()
  .filterDeep(() =>
    new SQBuilder().or().lte("createdAt", "date1").gte("createdAt", "date2")
  )
  .build();
```

```ts
// Before
const queryV1 = new SQBuilder()
  .filters("Category")
  .with<CategoryType>((categoryBuilder) =>
    categoryBuilder
      .or()
      .filters("name", (b) => b.contains("phones"))
      .filters("createdAt", (b) => b.gte("date2"))
  );

// After
const queryV4 = new SQBuilder()
  .filterRelation("Category", () =>
    new SQBuilder().or().contains("name", "phones").gte("createdAt", "date2")
  )
  .build();
```

## Populate

- Callback changed its signature from `(builder) => void` to `() => new builder()`

```ts
// Before
const queryV1 = new SQBuilder().populate("*").build();

// After
const queryV4 = new SQBuilder().populateAll().build();
```

```ts
// Before
const queryV1 = new SQBuilder().populate(["Category", "Seo"]).build();

// After
const queryV4 = new SQBuilder().populates(["Category", "Seo"]).build();
// or
const queryv4 = new SQBuilder().populate("Category").populate("Seo").build();
```

```ts
// Before
const queryV1 = new SQBuilder()
  .populate("Category", (categoryBuilder) =>
    categoryBuilder.filters("name").eq("phones")
  )
  .build();

// After
const queryV4 = new SQBuilder()
  .populateRelation("Category", () => new SQBuilder().eq("name", "phones"))
  .build();
```

```ts
// Before
const queryV1 = new SQBuilder()
  .populate("DynamicZone", (zoneBuilder) =>
    zoneBuilder.on("zone.component", (zoneComponent) => {
      zoneComponent.fields(["title", "other"]);
    })
  )
  .build();

// After
const queryV4 = new SQBuilder()
  .populateDynamic("DynamicZone", "zone.component", () =>
    new SQBuilder().fields(["title", "other"])
  )
  .build();
```

## Fields

- The `.field` and `.fields` operator has not changed.

## Sort

- builder no longer accepts order default config.
- Removed passing sorting as an object or objects `.sort({ key: "key5", type: "asc" })`
- Operators have become more explicit.
- Removed `.asc()` `.desc()` operators.
- Added separate functions `.sortAsc("key")`, `.sortsAsc(["key"])`, `.sortDesc("key")`, `.sortsDesc(["key"])`, `.sort(“key”, “order”)`, `.sorts([“key”], “order”)`

```ts
const queryV1 = new SQBuilder({ defaultSort: "asc" })
  .sort("key1")
  .sort(["key2", "key3"])
  .sort("key8.subkey")
  .desc();

const queryV4 = new SQBuilder()
  .sortAsc("key1")
  .sortsAsc(["key2", "key3"])
  .sortDesc("key8.subkey");
```

## Pagination

- withCount moved to `RQBuilder` (REST API Query Builder).
- `.pageStart(1)` `.pageLimit(10)` changed to `.start(1)` `.limit(10)`.
- `QQBuilder` (Query Engine Builder), uses only `.start(1)` `.limit(10)`.

## Locale, publication state, data

- Locale, publicationState available only for `RQBuilder` and `SQBuilder`.
- `data` available for all queries.

## Readonly

- Readonly completely deleted.
