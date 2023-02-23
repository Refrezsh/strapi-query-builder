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

> For get the most out of the library with Typescript, but that does not prevent it from being used with pure JS as well.

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

// or

query.build("strapiService"); // Default
query.build("entityService");
query.build("queryEngine");
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

> A distinction is made between simple types for attribute values, objects and arrays of objects for populations. In order to give handy autocompletion or strict typing.

> There are cases with types with cyclic dependency, this problem should not arise here

## Filtering

To start the filters process, call the `.filters()`. The first argument can be an attribute, a callback, or just an empty filter.

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

All attributes from the Strapi docs are supported. [Strapi filters](https://docs.strapi.io/dev-docs/api/entity-service/filter)

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
  .and() // For this case "and" is default and can be omited. ".and()" filter is possible to install at any point of the query
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

And if types are specified, then if you try to attach queries for the wrong type - there will be type error.

> JoinFilters has second boolean param `mergeRootLogical` to indicate whether the root logic filter needs to be overwritten by joined query
> Join function: `builder.joinFilters(otherBuilder)`

## Populating

The population can be simple or very complex. For the population of everything as in Strapi you can use `*`

```ts
const filterCategories = new SQBuilder().populate("*").build();
```

Or use the key list for the population

```ts
const filterCategories = new SQBuilder().populate(["Category", "Seo"]).build();
```

> If a type with attached data is provided, only the keys of these attached data will be displayed for the population

> Join function: `builder.joinPopulation(otherBuilder)`

### A complex population

Strapi allows filtering sort, select fields from the resulting data, or do population at even deeper levels.
To do this, it is enough to specify one key and with the second parameter get a new builder callback where we can perform filtering, sorting etc.

```ts
const filterCategories = new SQBuilder()
  .populate<CategoryType>("Category", (categoryBuilder) =>
    categoryBuilder.filters("name").eq("phones")
  )
  .build();
```

That is, it's possible to attach filters, sorting or even populations to both sub-builders and the main builder.

> More examples here

### Populate fragments

Strapi has a powerful solution in the form of dynamic zones. Builder also supports this by `.on` operator. [Strapi populate fragment](https://docs.strapi.io/dev-docs/api/entity-service/populate#populate-fragments)

```ts
const filterCategories = new SQBuilder()
  // Dynamic zone can contains morph types
  .populate("DynamicZone", (zoneBuilder) =>
    // With "on" filter we can define key of component, type
    // and get component builder to create filtering, field selection or etc.
    zoneBuilder.on<Type>("zone.component", (zoneComponent) => {
      zoneComponent.fields(["title", "other"]);
    })
  )
  .build();
```

> More examples here

## Sort, Fields, Pagination, PublicationState, Locale, Data

### Sorting

You can sort by key, by array of keys, by array of objects with direction, as well as add `.asc()` `.des()` operators to it all. [Strapi Ordering](https://docs.strapi.io/dev-docs/api/entity-service/order-pagination#ordering)

```ts
const filterCategories = new SQBuilder({ defaultSort: "asc" }) // Set gloval default sort
  .sort("key1") // Sort by one key
  .sort(["key2", "key3"]) // Sort by array of keys
  .sort("key4")
  .asc() // Set last key4 as asc
  .sort({ key: "key5", type: "asc" }) // Sort by raw object
  .sort([{ key: "key6", type: "asc" }, [{ key: "key7", type: "asc" }]]) // Sort by array of raw object
  .sort("key8.subkey") // Sort by object path notation
  .desc() // Set "key8.subkey" as desc
  .desc(true) // ".asc()" and ".desc()" can get one parametr to set all sort to one direction
  .build();
```

> The same keys will be merged

> Join function: `builder.joinSort(otherBuilder)`

### Fields

[Select the fields to be obtained](https://docs.strapi.io/dev-docs/api/rest/populate-select#field-selection), in the case of typing only simple attributes will be displayed,
as well as the same keys are merged.

```ts
const filterCategories = new SQBuilder()
  .fields("key1") // Just key
  .fields(["key2", "key3"]) // Array of keys
  .build();
```

> Join function: `builder.joinFields(otherBuilder)`

### Pagination

Strapi has a high-level pagination API which is available only to [StrapiService and RestAPI](https://docs.strapi.io/dev-docs/api/rest/sort-pagination#pagination-by-page) and offset pagination for [EntityService and Query Engine](https://docs.strapi.io/dev-docs/api/entity-service/order-pagination#pagination)

> If pagination is specified for a page, it will be built only for the strapiService build. Offset pagination is built for all types of queries.

```ts
const filterCategories = new SQBuilder()
  .page(1) // Page pagination
  .pageSize(24) // Change page size
  .pageStart(1) // Offest pagination
  .pageLimit(10) // Offset limit
  .build();
```

> Join function: `builder.joinPagination(otherBuilder)`

### PublicationState

Strapi has a high-level [Publication state](https://docs.strapi.io/dev-docs/api/rest/filters-locale-publication#publication-state) which can be specified, but will only work for the strapiService.

```ts
const filterCategories = new SQBuilder()
  .publicationState("live") // Live
  .publicationState("preview") // Preview
  .build();
```

### Locale

Strapi has a high-level [Locale](https://docs.strapi.io/dev-docs/api/rest/filters-locale-publication#locale) which can be specified, but will only work for the strapiService.

```ts
const filterCategories = new SQBuilder()
  .locale("uk-UA") // Any string code
  .build();
```

### Data

It is also possible to add any type of Data and the data itself through the operator `.data()`

```ts
const filterCategories = new SQBuilder().data<DataType>(data).build();
```

> PublicationState, Locale, Data don't merge and have no merge functions because no such case was found.

## Readonly

Some queries are inherently constants and do not change while the application is running.
For this, there is a `.readonly(boolen)` operator that merely blocks all operators except itself.

> Readonly doesn't freeze the object, so you can turn it off at any time, only if you haven't already built a query.

## Applications and performance

### Custom Strapi services

That's basically what it was designed to do. Here are a few points:

- Create queries on the fly in the service itself
- Combine them on the fly from multiple readonly
- Create already built queries constants while running the application
- Create a separate factory method for a specific API or a set of generalized queries. It's up to you

Of course, if your queries are very simple, then writing them manually in the form of an object is the best option.

But, Here is an example of a real query to get certain fields from a dynamic zone

```ts
const dynamicLayoutPopulate = new SQBuilder().populate(
  "Layout",
  (layoutBuilder) => {
    layoutBuilder
      .on<IAlert>("layout.alert", (alertBuilder) => {
        alertBuilder.fields(["type", "message"]);
      })
      .on<IArticle>("layout.article", (articleBuilder) => {
        articleBuilder.fields(["Article"]);
      })
      .on<ISlider>("layout.slider", (sliderBuilder) => {
        sliderBuilder
          .fields([
            "SliderTimeoutSeconds",
            "EnableDots",
            "Arrows",
            "AutoScroll",
            "SideImages",
          ])
          .populate<ILinkImage>("Slides", (photoBuilder) =>
            photoBuilder
              .fields(["Link"])
              .populate<IPhoto>("Image", (imgBuilder) =>
                imgBuilder.joinFields(imageFields)
              )
          );
      })
      .on<IServerCardList>("layout.cardlist", (serverCardBuilder) => {
        serverCardBuilder.populate<IServerCard>("Cards", (cardBuilder) =>
          cardBuilder
            .fields(["Title", "Description"])
            .populate<IPhoto>("Image", (photoBuilder) =>
              photoBuilder.joinFields(imageFields)
            )
        );
      })
      .on<IFaq>("layout.faq", (faqBuilder) =>
        faqBuilder.fields(["Question", "Answer"])
      )
      .on<ISocialLinks>("layout.social-links", (socialLinksBuilder) => {
        socialLinksBuilder.populate<IIconLink>("Links", (b) => {
          b.fields(["Link", "Alt"]).populate<IPhoto>("Icon", (imgb) =>
            imgb.joinFields(imageFields)
          );
        });
      });
  }
);
```

And I won't give you an example of how it looked like an object because it's even harder to read.

### Backend part of Frontend (Next, Remix etc.)

If there are complex queries on the server side of your frontend, this builder can also be used in combination with [qs](https://www.npmjs.com/package/qs)

```ts
const query = qs.stringify(
  new SQBuilder().publicationState("live").publicationState("preview").build(),
  {
    encodeValuesOnly: true,
  }
);
```

### Performance

Since these builders are often used to get static data for the frontend, it has no effect on the Strapi backend.

In the case of using the builder in frequently requested end-points, I also did not find a serious reduction in speed.

> The project has a simple speed check for 100 iterations, constructing and parsing queries.
> The average build and parsing time takes 0.18ms.
> A better benchmark will be added in the future.

> So all the key functions are covered by tests on 96%

## Improvements

If you have suggestions or improvements, nice =) I would love to connect you to the project.
This project is somewhat non-commercial and has been used and tested by me personally in my projects for a very long time.

## Licensing

Since this was conceived as a utility for typing keys in Strapi query =)
you can copy the sources and do with them whatever you want under you.
This repository will be systematically updated
