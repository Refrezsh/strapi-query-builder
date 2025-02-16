# Strapi query builder

Utility for type safe queries for [Strapi Headless CMS](https://strapi.io/)

> A new version of the library is available with `strapi4` npm tag. Clearer syntax, exact type return for integration with `Strapi` typing, compilable queries.
> [NPM Page](https://www.npmjs.com/package/strapi-query-builder/v/4.0.1), [migration](https://github.com/Refrezsh/strapi-query-builder/blob/v4/migration/V4Migration.md).
> This version will not be removed or changed so as not to create unpleasant surprises.

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

Requirement: Strapi v4 or above.

## Why?

Strapi has flexible syntax for building queries, as the project grows the logic of the queries becomes complex it becomes difficult to keep track of errors in syntax.

> For get the most out of the library use it with Typescript.

## Basic example

```ts
import SQLBuilder from "strapi-query-builder";

const query = new SQBuilder()
  .filters("title").eq("Hello World")
  .filters("createdAt").gte("2021-11-17T14:28:25.843Z")
  .build();
```

This is equivalent to writing.

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

We can improve readability through callbacks and add IDE autocompletion if we provide the type for which the query is executed.

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
It's similar but has different syntax's for query.

1. [Strapi Service (Rest API Query)](https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/api-parameters.html)
2. [Strapi Entity Service](https://docs.strapi.io/dev-docs/api/entity-service)
3. [Strapi Query Engine](https://docs.strapi.io/dev-docs/api/query-engine)

```ts
const serviceBuilt = query.buildStrapiService(); // Build for strapi "service factory" query
const entityServiceBuilt = query.buildEntityService(); // Build for strapi entity query
const queryEngineBuilt = query.buildQueryEngine(); // Build for strapi query engine

// or

query.build("strapiService"); // Default
query.build("entityService");
query.build("queryEngine");
```

## Types

This util can be used without type, with type, and in strict typing mode.
Strict type is defined by the presence of an `id` attribute in the type.

For example, this one will display autocompletion for filtering, sorting, and population, but will not strictly require right keys.

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

> A distinction is made between simple types for attribute values, objects and arrays of objects for populations. In order to give handy autocompletion.

## Filtering

To start the filters, call the `.filters()` operator. The first argument can be an attribute, a callback, or just an empty filter.

```ts
const query = new SQBuilder()
  .filters("title", (b) => b.eq("Hello World")) // Callback value "b" is the same builder
  .filters("updatedAt").contains("24.02.2022") 
  .filters(
    (b) =>
      // Empty filter to start another filter with deep nested query
      b.with((nestedBuilder) => nestedBuilder.filters("nested").eq("other")) // With creates new builder for nesting.
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
  .between(["five", "six"]) // For this chain last ".between()" filter will be applied for "title"
  .build();
```

### Logical filter

There are 3 logical filters in Strapi, `$and` `$or` `$not`. SQBuilder supports these filters.

By standard, as in Strapi root filter is `$and`

#### .and()

```ts
const query = new SQBuilder()
  .and() // For this case "and" is default and can be omited.
  .filters("title").eq("one")
  .filters("createdAt").containsi("2021")
  .build();
```

#### .or()

```ts
const query = new SQBuilder()
  .or() // Set root logical as or
  .filters("title").eq("one")
  .filters("createdAt").containsi("2021")
  .build();
```

This is equivalent to writing.

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

Logical `$not` can negate all root or any of attribute filter. For example, to negate root filter, just add not on top level.

```ts
const query = new SQBuilder()
  .not() // Negates all root filter
  .or() // Set root logical operator as or
  .filters("title").eq("one")
  .filters("createdAt").containsi("2021")
  .build();
```

This is equivalent to writing.

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

This is equivalent to writing.

```ts
const query = {
  filters: {
    title: { $not: { $eq: "one" } },
  },
};
```

### Nested filters and filter join

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

In this case, you do not need to call the build on nested builders, it will be done automatically.

#### Filters join

In some cases, it's useful to divide the filtering into parts.
For example, you would like to have one query to filter the category and then reuse it for example in the product query.

Let's rewrite the example above

```ts
// If query not built it can be used as a variable.
const filterCategories = new SQBuilder<CategoryType>()
  .filters("name", (b) => b.contains("phones"))
  .filters("createdAt", (b) => b.gte("date"));

const builtQuery = new SQBuilder<ProductType>()
  // ...Other filters, population etc.

  // Now we can join filters from other builder to any of nested or root builder
  .filters("Category")
  .with<CategoryType>((categoryBuilder) =>
    categoryBuilder.joinFilters(filterCategories)
  )
  .build();
```

> JoinFilters has second boolean param `mergeRootLogical` to indicate whether the root logic filter needs to be overwritten by joined query

> Join function: `builder.joinFilters(otherBuilder)`

## Population

The population can be simple or really complex. For the population of everything as in Strapi you can use `*`

```ts
const filterCategories = new SQBuilder().populate("*").build();
```

Or use the key list to populate.

```ts
const filterCategories = new SQBuilder().populate(["Category", "Seo"]).build();
```

> If a type with attached data is provided, only the keys of these attached data will be displayed for the population

> Join function: `builder.joinPopulation(otherBuilder)`

### Complex population

Strapi allows filtering, sorting, selecting fields from the populating data, or do population at even deeper levels.
To do this, it is enough to specify one key and with the second parameter get a new builder callback where we can perform filtering, sorting etc.

```ts
const filterCategories = new SQBuilder()
  .populate<CategoryType>("Category", (categoryBuilder) =>
    categoryBuilder.filters("name").eq("phones")
  )
  .build();
```

### Populate fragments (Dynamic Zones)

Strapi has a powerful solution in the form of dynamic zones. SQBuilder also supports this by `.on` operator. [Strapi populate fragment](https://docs.strapi.io/dev-docs/api/entity-service/populate#populate-fragments)

```ts
const filterCategories = new SQBuilder()
  // Dynamic zone can contains morph types
  .populate("DynamicZone", (zoneBuilder) =>
    // With "on" filter we can define key of component
    // and get component builder to create filtering, field selection or etc.
    zoneBuilder.on<Type>("zone.component", (zoneComponent) => {
      zoneComponent.fields(["title", "other"]);
    })
  )
  .build();
```

## Sort, Fields, Pagination, PublicationState, Locale, Data

### Sorting

You can sort by key, by array of keys, by array of objects with direction, as well as add `.asc()` `.des()` operators to it all. [Strapi Ordering](https://docs.strapi.io/dev-docs/api/entity-service/order-pagination#ordering)

```ts
const filterCategories = new SQBuilder({ defaultSort: "asc" }) // Set gloval default sort
  .sort("key1") // Sort by one key
  .sort(["key2", "key3"]) // Sort by array of keys
  .sort("key4")
  .asc() // Set "key4" as asc
  .sort({ key: "key5", type: "asc" }) // Sort by raw object
  .sort([{ key: "key6", type: "asc" }, [{ key: "key7", type: "asc" }]]) // Sort by array of raw object
  .sort("key8.subkey") // Sort by object path notation
  .desc() // Set "key8.subkey" as desc
  .desc(true) // ".asc()" and ".desc()" can get one parametr to set all sort to one direction
  .build();
```

> Same keys will be merged.

> Join function: `builder.joinSort(otherBuilder)`

### Fields

[Select the fields to be obtained](https://docs.strapi.io/dev-docs/api/rest/populate-select#field-selection), in the case of typing only simple attributes will be displayed,
as well, as the same keys are merged.

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
  .page(1, true) // Page pagination, second parameter is "withCount" that works only for strapiService.
  .pageSize(24) // Change page size
  .pageStart(1) // Offest pagination
  .pageLimit(10) // Offset limit
  .build();
```

> Join function: `builder.joinPagination(otherBuilder)`

### PublicationState

Strapi has a [Publication state](https://docs.strapi.io/dev-docs/api/rest/filters-locale-publication#publication-state) which can be specified, but will only work for the strapiService.

```ts
const filterCategories = new SQBuilder()
  .publicationState("live") // Live
  .publicationState("preview") // Preview
  .build();
```

### Locale

Strapi has a [Locale](https://docs.strapi.io/dev-docs/api/rest/filters-locale-publication#locale) which can be specified, but will only work for the strapiService.

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

> PublicationState, Locale, Data don't merge and have no merge functions.

## Readonly

Some queries are inherently constants and do not change while the application is running.
For this, there is a `.readonly(boolen)` operator that merely blocks all operators.

> Readonly doesn't freeze the object, so you can turn it off at any time, only if you haven't already built a query.

## Applications and performance

### Custom Strapi services

That's basically what it was designed to do. Here are a few points:

- Create queries on the fly in the services.
- Combine them on the fly from multiple queries.
- Create already built queries constants while running the application.
- Create a separate factory method for a specific API or a set of generalized queries. It's up to you.

If the queries are simple enough, you can do them with the standard syntax.
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

### Backend part of Frontend (Next, Remix etc.)

If there are complex queries on the server side of your frontend, this builder can also be used with [qs](https://www.npmjs.com/package/qs)

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

> The project has a simple speed check for 100 iterations, constructing and parsing queries.
> The average build and parsing time takes 0.18ms.

> All functions are covered by tests on 96%

## Improvements

If you have suggestions or improvements, I would love to see them.
This project is somewhat non-commercial and has been used and tested in a personal project.

## Licensing - MIT

You can copy the sources, and do with them whatever you want. 

