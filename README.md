# Strapi Query Builder v4

Utility for type safe queries for [Strapi Headless CMS](https://strapi.io/)

```bash
# via npm
npm install strapi-query-builder // Old version not-recomended and will be updated to v5 soon
npm install strapi-query-builder@v4 // Strapi v4 version
```

Import with

```js
const { SQBuilder } = require("strapi-query-builder");
// or
import { SQBuilder } from "strapi-query-builder";
```

## Why?

Strapi has flexible syntax for building queries, as the project grows the logic of the queries becomes complex it becomes difficult to keep track of errors in syntax.

> For get the most out of the library use it with Typescript.

## Features

- Advanced typescript autocompletion. When passing the model type to the query builder, it will give precise hints on which keys to use.
- Builder has two validation modes. Strict and non-strict. Strict mode works if there is `id` property in the model type.
- Builder creates the exact type of query on the output. This makes it easy to integrate with the internal typing of `Strapi` services themselves.
- The ability to attach query. You can write separate parts of a queries and then prepare complex query on the fly.
- Query compilation. Queries can be serialized into a TS/JS template and saved in the desired location. This way we can get complex and correct queries as if written by hand.

## Builder types
- `SQBuilder`: Main entity service. For Strapi v4 it's [Entity Service](https://docs-v4.strapi.io/dev-docs/api/entity-service).
- `QQBuilder`: [Strapi Query Engine](https://docs-v4.strapi.io/dev-docs/api/query-engine). Contains functions that are available only for Query Engine.
- `RQBuilder`: [REST API](https://docs-v4.strapi.io/dev-docs/api/rest). Contains functions and differences that are specific to the REST API.

## Basic example

```ts
import { SQBuilder } from "strapi-query-builder";

const query = new SQBuilder()
  .eq("title", "Hello World")
  .gte("createdAt", "2021-11-17T14:28:25.843Z")
  .build();

// Creates
const builtQuery = {
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
}; // Query has exact type so Entity Service can return correct return type.
```

We can improve readability through IDE autocompletion if we provide the type for which the query is executed.

```ts
import { SQBuilder } from "strapi-query-builder";

type Relation = {
  id: number; 
  option: string;
}

type Entity = {
  id: number; 
  title: string;
  createdAt: string;
  category: Relation
};

const query = new SQBuilder<Entity>()
  .eq("title", "Hello World")
  .gte("createdAt", "2021-11-17T14:28:25.843Z")
  .eq("prop", "error") // Will give TS error, because this property does not exist in Entity.
  .eq("category", "error") // Will give TS error, because category is a Relation, and we can't filter just by category, but only by its properties.
  .eq("category.option", "Hello World") // No error, besides IDE will also give autocompletion on Relation keys.
  .build();
```

## Types

This util can be used without type, with type, and in strict typing mode.
Strict type is defined by the presence of an `id` attribute in the type.

For example, this one will display autocompletion for filtering, sorting, and populate, but will not strictly require right keys.

```ts
type Entity = {
  title: string;
  createdAt: string;
};
```

This type will strictly require type keys, and will create type error if keys not provided correctly.

```ts
type Entity = {
  id: number;
  title: string;
  createdAt: string;
};
```

## Filtering

Builder contains all filter operators like .`eq()`, `notEq()`, `contains()`, etc. Besides, there are special operators for adding deep filtering for the current model `filterDeep()` or filtering for Relation, `filterRelation()`.

```ts
const query = new SQBuilder<Entity>()
  .eq("title", "Hello World") // or .filter("title", "$eq", "Hello World")
  .filterDeep(() => new SQBuilder<Entity>()
    .or()
    .contains("updatedAt", "17.03.2022")
    .contains("updatedAt", "24.02.2022")) // Creates another $or: [...] filter in current filters.
  .filterRelation("category", () => new SQBuilder<Relation>().eq("option", "Hello")) // Autocompletion for all Relation keys of Entity. Creates a filter to filter by Relation.
  .build();
```

### Attributes

All attributes from the Strapi docs are supported. [Strapi filters](https://docs-v4.strapi.io/dev-docs/api/entity-service/filter)

### Logical filter

There are three logical filters in Strapi, `$and` `$or` `$not`. SQBuilder supports these filters. 
By default, as in Strapi root filter is `$and`

#### .and()

```ts
const query = new SQBuilder()
  .and() // For this case "and" is default and can be omited.
  .eq("title", "one")
  .containsi("createdAt", "2021")
  .build();
```

#### .or()

```ts
const query = new SQBuilder()
  .or() // Set root logical as $or
  .eq("title", "one")
  .containsi("createdAt", "2021")
  .build();

// Creates
const builtQuery = {
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

Logical `$not` can negate all root. For example.

```ts
const query = new SQBuilder()
  .not() // Negates all root filter
  .or() // Set root logical operator as or
  .eq("title", "one")
  .containsi("createdAt", "2021")
  .build();

// Creates
const builtQuery = {
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

To negate an attribute, just call `.notEq()` etc. or use `.filterNot("key", "$operator", "value")`

```ts
const query = new SQBuilder()
  .notEq("title", "one")
  .build();

// Creates
const builtQuery = {
  filters: {
    title: { $not: { $eq: "one" } },
  },
};
```

### Nested filters and filter join

#### Nested filters

To create a nested filter, use the `.filterDeep` operator.
To create a relation filter, use the `.filterRelation` operator.

```ts
const builtQuery = new SQBuilder<ProductType>()
  // Just nested filter an same root level
  .filterDeep(() => new SQBuilder<ProductType>()
      .or()
      .lte("createdAt", "date1")
      .lte("createdAt", "date2")
  )

  // Filters by relations - with can acept type for typing nested builder
  .filterRelation("Category", () => new SQBuilder<CategoryType>()
    .or()
    .contains("name", "phones")
    .gte("createdAt", "date2")
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
  .contains("name", "phones")
  .gte("createdAt", "date");

const builtQuery = new SQBuilder<ProductType>()
  // ...Other filters, population etc.
  // Now we can join filters from other builder to any of nested or root builder
  .filterRelation("Category", () => filterCategories)
  // or
  .filterRelation("Category", () => new SQBuilder<CategoryType>().joinFilters(filterCategories))
  .build();
```

## Populate

The population can be simple or really complex. For the population of everything as in Strapi you can use `.populateAll()`

```ts
const populateAll = new SQBuilder().populateAll().build();
```

Or use the key list to populate.

```ts
const populateWithList = new SQBuilder().populates(["Category", "Seo"]).build();
// Or
const populateSpecific = new SQBuilder().populate("Category").populate("Seo").build();
```

> Join function: `builder.joinPopulate(otherBuilder)`

### Complex population

Strapi allows filtering, sorting, selecting fields from the populating data, or do population at even deeper levels.
There are `.populateRelation()` and `.populateDynamic()` operators for this purpose.

```ts
const populateCategoriesWithFilter = new SQBuilder()
  .populateRelation("Category", () =>
    new SQBuilder<CategoryType>().eq("name", "phones")
  )
  .build();
```

### Populate fragments (Dynamic Zones)

Strapi has a powerful solution in the form of dynamic zones. SQBuilder also supports this by `.populateDynamic()` operator. [Strapi populate fragment](https://docs-v4.strapi.io/dev-docs/api/entity-service/components-dynamic-zones)

```ts
const populateDynamicZone = new SQBuilder()
  .populateDynamic("DynamicZone",  "zone.component", () =>
    new SQBuilder<Type>().fields(["title", "other"])
  )
  .build();
```

## Sort, Fields, Pagination, PublicationState, Locale, Data

### Sorting

You can sort by key or by array of keys. [Strapi Ordering](https://docs-v4.strapi.io/dev-docs/api/entity-service/order-pagination#ordering)

```ts
const filterCategories = new SQBuilder() 
  .sortAsc("key1") // Sort by one key
  .sortsAsc(["key2", "key3"]) // Sort by array of keys
  .sortDesc("key8.subkey") // Set "key8.subkey" as desc
  .sort("key4", "$asc") // Set sorting explicitly
  .build();
```

> Same keys will be merged.

> Join function: `builder.joinSort(otherBuilder)`

### Fields

[Select the fields to be obtained](https://docs-v4.strapi.io/dev-docs/api/rest/populate-select#field-selection), in the case of typing only simple attributes will be displayed,
as well, as the same keys are merged.

```ts
const filterCategories = new SQBuilder()
  .field("key1") // Single attribute
  .fields(["key2", "key3"]) // Array of attributes
  .build();
```
> Same keys will be merged.

> Join function: `builder.joinFields(otherBuilder)`

### Pagination

Strapi has a high-level pagination API which is available only to Entity Service and REST-API and offset pagination for all query types.

```ts
const filterCategories = new SQBuilder()
  .page(1) // Page pagination
  .pageSize(24) // Change page size
  .start(1) // Offest pagination
  .limit(10) // Offset limit
  .build();
```

```ts
const filterCategories = new QQBuilder()
  .start(1) // Offest pagination only for Query Engine
  .limit(10) // Offset limit only for Query Engine
  .build();
```

```ts
const filterCategories = new RQBuilder()
  .page(1, true) // Page pagination, and withCount parameter
  .pageSize(24) // Change page size
  .start(1, true) // Offest pagination, and withCount parameter
  .limit(10) // Offset limit
  .build();
```

> Join function: `builder.joinPagination(otherBuilder)`

### PublicationState

Strapi has a [Publication state](https://docs-v4.strapi.io/dev-docs/api/rest/filters-locale-publication#publication-state) which can be specified, but will only work for the SQBuilder and RQBuilder.

```ts
const filterCategories = new SQBuilder()
  .publicationState("live") // Live
  .publicationState("preview") // Preview
  .build();
```

### Locale

Strapi has a [Locale](https://docs-v4.strapi.io/dev-docs/api/rest/filters-locale-publication#locale) which can be specified, but will only work for the SQBuilder and RQBuilder.

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


## Applications and performance

### Custom Strapi services

That's basically what it was designed to do. Here are a few points:

- Create queries on the fly in the services.
- Combine them on the fly from multiple queries.
- Create already built queries constants while running the application.
- Create a separate factory method for a specific API or a set of generalized queries. It's up to you.

If the queries are simple enough, you can do them with the standard object literals.
But, Here is an example of a real query to populate certain fields from a dynamic zone

```ts
const dynamicLayoutPopulate = new SQBuilder()
  .populateDynamic("Layout", "layout.alert", () => new SQBuilder<IAlert>()
    .fields(["type", "message"])
  )
  .populateDynamic("Layout", "layout.article", () => new SQBuilder<IArticle>().field("Article"))
  .populateDynamic("Layout", "layout.slider", () => new SQBuilder<ISlider>()
    .fields([
      "SliderTimeoutSeconds",
      "EnableDots",
      "Arrows",
      "AutoScroll",
      "SideImages",
    ])
    .populateRelation("Slides", () => new SQBuilder<ILinkImage>()
      .field("Link")
      .populateRelation("Image", () => GenericBuilder.imgBuilder())
    )
  )
  .populateDynamic("Layout", "layout.faq", () => new SQBuilder<IFaq>()
    .fields(["Question", "Answer"])
  )
  .populateDynamic("Layout", "layout.cardlist", () => new SQBuilder<IServerCard>()
    .populateRelation("Cards", () => new SQBuilder<IServerCard>()
      .fields(["Title", "Description"])
      .populateRelation("Image", () => GenericBuilder.imgBuilder())
    )
  );
```

### Performance

Since these builders are often used to get static data for the frontend, it has little or no effect on the Strapi backend.

> The project has a simple speed check for 500 iterations, constructing and parsing queries.
> The average build and parsing time takes 0.032ms.

> All functions are covered by tests on 96%

### Query Compilation

If you still prefer object literal syntax, as it is by far the fastest. 
You can still use the convenient query builder syntax with TS checks. 
Since such queries can be generated into a string template and saved as a ts/js file.

There is a function compileStrapiQuery for this purpose.
The function accepts any builder and returns serialized data.

```ts
import { compileStrapiQuery } from "strapi-query-builder";

const serialized = compileStrapiQuery(new SQBuilder(), { compileSource: "typescript" });

// Returns
type SerializeOutput = {
  query: string; // Serialized as object literal with additional as const casting for compatibility with type checks of Strapi Service.
  constants: string; // compileStrapiQuery can find the same fields and sorts and put them into separate variables. This also slightly increases the speed of queries creation.
}
```

> This is a more difficult idea to implement, as you will have to figure out separately how to store SQBuilder queries and how to store object literals.

To give an example as an idea.

```ts
// src/api/blog/query/static-queries.ts
import { SQBuilder } from "./sq-builder";

export default {
  getBlogPostSitemap: () => new SQBuilder(),
  getBlogPostPreview: () => new SQBuilder()
  // ...
}

// src/utils/compile-static.ts
import blogQueries from "../../";
import { compileStrapiQuery } from "strapi-query-builder";

const compileQuery = () => {
  const compiledQuery = getCompiledQuery("blogQuery", blogQueries);
  
  // Save compiledQuery as file for example src/api/blog/query/static-queries.query.ts
  // Then we can add package script to run compile and for example call prettier to format *.query.ts files
  // After compile inside services we can now use generated static-queries.query.ts file.
}

// Parse object as new object string template with functions that returns query as literals
const getCompiledQuery = (queryName: string, query: QueryObject) => {
  const entries = Object.entries(query)
    .map(([key, queryFabric]) => `${key}:${getQueryString(queryFabric())}`)
    .join(",");

  return `const ${queryName} = {${entries}};export default ${queryName};`;
};

// Create function string template
const getQueryString = (builder: any) => {
  const compiled = compileStrapiQuery(builder);
  
  return `() => {
  ${compiled.constants}
  return ${compiled.query};
  }`;
};
```


### Backend part of Frontend (Next, Remix etc.)

If there are complex queries on the server side of your frontend, this builder can also be used with [qs](https://www.npmjs.com/package/qs)

```ts
const serializedQuery = qs.stringify(
  new RQBuilder().publicationState("preview").build(),
  {
    encodeValuesOnly: true,
  }
);
```

## Improvements

If you have suggestions or improvements, I would love to see them.
This project is somewhat non-commercial and has been used and tested in a personal project.

## Licensing - MIT

You can copy the sources, and do with them whatever you want. 

