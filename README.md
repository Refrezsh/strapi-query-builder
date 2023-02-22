Strapi query builder
===========

Utility for creating typed queries for [Strapi Headless CMS](https://strapi.io/).

```bash
# via npm
npm install strapi-query-builder
```
Use with [Node.js](https://nodejs.org/en/):

```js
var SQLBuilder = require('strapi-query-builder');
```
or
```ts
import SQLBuilder from 'strapi-query-builder';
```
Requirement: Strapi v4 or above

##Why?
Strapi has a very flexible syntax for building queries, but as the project grows or as the logic of the query becomes complex, 
it becomes difficult to keep track of the correctness of the query.

This library was just meant to be used for typical field tracking, but in the process of work it became necessary to use something more convenient.

> You can get the most out of the library with Typescript, but that does not prevent it from being used with pure JS as well.

##Basic example
```ts
import SQLBuilder from 'strapi-query-builder';

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
        title: 'Hello World',
      },
      {
        createdAt: { $gt: '2021-11-17T14:28:25.843Z' },
      },
    ],
  },
};
```
But that's not all, we can improve readability through callbacks and add IDE tips if we provide the type for which the query is executed
```ts
import SQLBuilder from 'strapi-query-builder';

type Entity = {
  title: string;
  createdAt: string;
};

const query = new SQBuilder<Entity>()
  .filters("title", (b) => b.eq("Hello World"))
  .filters("createdAt", (b) => b.gte("2021-11-17T14:28:25.843Z"))
  .build()
```
This is a small example of filtering, but you can already build query for 3 Strapi types.
It's similar but has different syntax's for Query.

1. [Strapi Service (API Query)](https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/api-parameters.html)
2. [Strapi Entity Service](https://docs.strapi.io/dev-docs/api/entity-service)
3. [Strapi Query Engine](https://docs.strapi.io/dev-docs/api/query-engine)

```ts
    const serviceBuilt = query.buildStrapiService();
    const entityServiceBuilt = query.buildEntityService();
    const queryEngineBuilt = query.buildQueryEngine();
```


##Typing
This plugin can be used without type, with type, and in strict typing mode.
Strict type is defined by the presence of an `id` in the type.

For example, this one will display autocompletion for filtering, sorting, and population, but will not strictly require key compliance
```ts
type Entity = {
  title: string;
  createdAt: string;
};
```
This type will strictly require type keys, and will create a compile-time error if not provided correctly
```ts
type Entity = {
  id: number;
  title: string;
  createdAt: string;
};
```

A distinction is made between simple types for attribute values, objects and arrays of objects for populations. In order to give handy autocompletion or strict typing.

##Filtering
To start the filtration process, call the filters. The first argument can be an attribute, a callback, or just an empty filter.

```ts
const query = new SQBuilder()
  .filters("title", (b) => b.eq("Hello World")) // Callback builder is the same builder
  .filters("updatedAt") // Chain start
  .contains("24.02.2022") // Chain ends
  .filters((b) =>
    // Just empty filters to start another filter with deep nested query
    b.with((nestedBuilder) => nestedBuilder.filters("nested").eq("other")) // With creates new builder for nesting, look exaple.
  ).build();
```

###Attributes
All attributes from the Strapi list are supported, Also for attributes with lists, the value type is an array `$in` `$notIn` etc.
```ts
const query = new SQBuilder<Entity>()
  .filters("title")
  .eq("one")
  .containsi("two")
  .in(["three"])
  .null(false)
  .between(["five", "six"]) // For this chain last .between filter will be applied
```

Documentation is still in the works 
Loading...