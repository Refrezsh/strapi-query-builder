import { SQBuilder } from "./sq-builder";
import { RQBuilder } from "./rq-builder";
import { QQBuilder } from "./qq-builder";

// TODO: Start of experimental feature that must provide utilities for compiling any query to Object literal with strong type.

// The idea is as follows.
// Most queries are not dynamic, but static get queries, with field selection, sorting and filtering.
// Only rare queries are created dynamically using input parameters.
// Even though the builder is fast enough to create queries, it is still not as fast as a standard JS literal.
// So the idea to compile queries into JS literal with type support appeared.
// This idea has already been realized in experimental form in a personal project, and damn it works.

// The burden of saving literals will be on the developer.
// But on average it can be easily implemented in the form of factory functions that return static queries. Like {getQuery: () => {filters: [...], etc.}}

// This is also the place where we can further optimize the creation of a literal for querys with repeating arrays.
// So we can create a hash table and use one array in the right places, as it will reduce the number of arrays created.

interface SerializeOutput {
  query: string;
  constants: string;
}

const compileQuery = (
  queryBuilder:
    | SQBuilder<any, any, any>
    | RQBuilder<any, any, any>
    | QQBuilder<any, any, any>
): SerializeOutput => {
  const query = queryBuilder.build();
  findForOptimize(query);

  return serializeQuery(query);
};

const serializeQuery = (query: any): SerializeOutput => {
  return {
    query: `{ filters: filterKeys1 }`,
    constants: `const filterKeys1 = ["someVeryRepitableArray"]`,
  };
};

const findForOptimize = (query: any) => {};
