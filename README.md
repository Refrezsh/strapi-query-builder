# Strapi query builder

Utility for creating type safe queries for [Strapi Headless CMS](https://strapi.io/).

```bash
# via npm
npm install strapi-query-builder
```

Use with [Node.js](https://nodejs.org/en/):

```js
const SQLBuilder = require("strapi-query-builder");
```

or

```ts
import SQLBuilder from "strapi-query-builder";
```

Requirement: Strapi v4 or above

## Why?

Strapi has a very flexible syntax for building queries, but as the project grows or as the logic of the query becomes complex,
it becomes difficult to keep track queries.

This library was just meant to be used for typical field tracking, but in the process of work it became necessary to use something more convenient.

> You can get the most out of the library with Typescript, but that does not prevent it from being used with pure JS as well.

## Basic example

```ts
import SQLBuilder from "strapi-query-builder";

const query = new SQBuilder()
  .filters("title")
  .eq("Hello World")
  .filters("createdAt")
  .gte("2021-11-17T14:28:25.843Z")
  .build();
```

This is equivalent to writing

```ts
const query = {
  filters: {
    $and: [
      {
        title: { $eq: "Hello World" },
      },
      {
        createdAt: { $gt: "2021-11-17T14:28:25.843Z" },
      },
    ],
  },
};
```

But that's not all, we can improve readability through callbacks and add IDE autocompletion if we provide the type for which the query is executed

```ts
import SQLBuilder from "strapi-query-builder";

type Entity = {
  title: string;
  createdAt: string;
};

const query = new SQBuilder<Entity>()
  .filters("title", (b) => b.eq("Hello World"))
  .filters("createdAt", (b) => b.gte("2021-11-17T14:28:25.843Z"))
  .build();
```

This is a small example of filtering, but you can already build query for 3 Strapi types.
It's similar but has different syntax's for Query.

1. [Strapi Service (API Query)](https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/api-parameters.html)
2. [Strapi Entity Service](https://docs.strapi.io/dev-docs/api/entity-service)
3. [Strapi Query Engine](https://docs.strapi.io/dev-docs/api/query-engine)

```ts
const serviceBuilt = query.buildStrapiService(); // Build strapi default service factory query
const entityServiceBuilt = query.buildEntityService(); // Build strapi entity query
const queryEngineBuilt = query.buildQueryEngine(); // Build strapi query engine
```

## Typing

This util can be used without type, with type, and in strict typing mode.
Strict type is defined by the presence of an `id` in the type.

For example, this one will display autocompletion for filtering, sorting, and population, but will not strictly require key compliance

```ts
type Entity = {
  title: string;
  createdAt: string;
};
```

This type will strictly require type keys, and will create type error if keys not provided correctly

```ts
type Entity = {
  id: number;
  title: string;
  createdAt: string;
};
```

A distinction is made between simple types for attribute values, objects and arrays of objects for populations. In order to give handy autocompletion or strict typing.

## Filtering

To start the filters process, call the filters. The first argument can be an attribute, a callback, or just an empty filter.

```ts
const query = new SQBuilder()
  .filters("title", (b) => b.eq("Hello World")) // Callback builder "b" is the same builder
  .filters("updatedAt") // Chain start
  .contains("24.02.2022") // Chain ends
  .filters(
    (b) =>
      // Just empty filters to start another filter with deep nested query
      b.with((nestedBuilder) => nestedBuilder.filters("nested").eq("other")) // With creates new builder for nesting, look exaple.
  )
  .build();
```

### Attributes

All attributes from the Strapi docs are supported.

```ts
const query = new SQBuilder()
  .filters("title")
  .eq("one")
  .containsi("two")
  .in(["three"])
  .null(false)
  .between(["five", "six"]) // For this chain last ".between()" filter will be applied
  .build();
```

### Logical filter

There are 3 logical filters in Strapi, `$and` `$or` `$not`. SQBuilder implements these filters. There can be one logical filter per query, not counting nested queries.

By standard, as in Strapi root filter is `$and`

#### .and()

```ts
const query = new SQBuilder()
  .and() // For this case "and" is default and can be omited. ".and()" filter is possible to install at any point of the queri
  .filters("title")
  .eq("one")
  .filters("createdAt")
  .containsi("2021")
  .build();
```

#### .or()

```ts
const query = new SQBuilder()
  .or() // Set root logical as or
  .filters("title")
  .eq("one")
  .filters("createdAt")
  .containsi("2021")
  .build();
```

This is equivalent to writing

```ts
const query = {
  filters: {
    $or: [
      {
        title: { $eq: "one" },
      },
      {
        createdAt: { $containsi: "2021" },
      },
    ],
  },
};
```

#### .not()

Logical `$not` can negate all root or any of attribute filter. For example, to negate root filter just add not on top level.

```ts
const query = new SQBuilder()
  .not() // Negates all root filter
  .or() // Set root logical as or
  .filters("title")
  .eq("one")
  .filters("createdAt")
  .containsi("2021")
  .build();
```

This is equivalent to writing

```ts
const query = {
  filters: {
    $not: {
      $or: [
        {
          title: { $eq: "one" },
        },
        {
          createdAt: { $containsi: "2021" },
        },
      ],
    },
  },
};
```

To negate an attribute, just set a `.not()` before the filter of that attribute.

```ts
const query = new SQBuilder()
  .filters("title", (b) => b.not().eq("one"))
  .build();
```

This is equivalent to writing

```ts
const query = {
  filters: {
    title: { $not: { $eq: "one" } },
  },
};
```

### Nested filters and filter joining

#### Nested filters

To create a nested filter, use the `.with(callback)` operator.
A nested filter can be either in the root filter structure or nested for an attribute.

```ts
const builtQuery = new SQBuilder<ProductType>()
  // Just nested filter an same root level
  .filters((b) =>
    b.with((nestedBuilder) =>
      nestedBuilder
        .or()
        .filters("createdAt", (b) => b.lte("date1"))
        .filters("createdAt", (b) => b.gte("date2"))
    )
  )

  // Filters by relations - with can acept type for typing nested builder
  .filters("Category")
  .with<CategoryType>((categoryBuilder) =>
    categoryBuilder
      .or()
      .filters("name", (b) => b.contains("phones"))
      .filters("createdAt", (b) => b.gte("date2"))
  )
  .build();
```

In this case you do not need to call the build on nested builders.

#### Filters join

In some cases, it is useful to divide the filtering into parts.
For example, You would like to have one query to filter the category and then reuse it for example in the product query.

Let's rewrite the example above

```ts
// If query not builder it can be used as a variable. So we create some Category query
const filterCategories = new SQBuilder<CategoryType>()
  .filters("name", (b) => b.contains("phones"))
  .filters("createdAt", (b) => b.gte("date2"));

const builtQuery = new SQBuilder<ProductType>()
  // ...Other filters, population etc.

  // Now we can join filters from other builder to any of nested or root builder
  .filters("Category")
  .with<CategoryType>((categoryBuilder) =>
    categoryBuilder.joinFilters(filterCategories)
  )
  .build();
```

And if types are specified then if you try to attach queries for the wrong type there will be type error.

> JoinFilters has second boolean param `mergeRootLogical` to indicate whether the root logic filter needs to be overwritten by joined query



Documentation is still in the works
Loading...
