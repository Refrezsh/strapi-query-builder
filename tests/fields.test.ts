import { SQBuilder } from "../src/sq-builder";

const field = "key1";
const filed1 = "key2";

const getFields = (key: string, key2: string) => ({ fields: [key, key2] });

describe("Fields query", () => {
  it("Chain", () => {
    const builtQuery = new SQBuilder().fields(field).fields(filed1).build();

    expect(builtQuery).toEqual(getFields(field, filed1));
  });

  it("Array", () => {
    const builtQuery = new SQBuilder().fields([field, filed1]).build();

    expect(builtQuery).toEqual(getFields(field, filed1));
  });

  it("Same keys", () => {
    const builtQuery = new SQBuilder()
      .fields([field, filed1, field, filed1])
      .build();

    expect(builtQuery).toEqual(getFields(field, filed1));
  });

  it("Merging", () => {
    const query1 = new SQBuilder().fields([field]);
    const query2 = new SQBuilder().fields([filed1]);
    const query3 = new SQBuilder().fields([field]);

    const builtQuery = query1.joinFields(query2).joinFields(query3).build();

    expect(builtQuery).toEqual(getFields(field, filed1));
  });
});
