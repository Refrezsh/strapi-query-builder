import { SQBuilder } from "../../lib/cjs";

const field = "key1";
const filed1 = "key2";

const getFields = (key: string, key2: string) => ({ fields: [key, key2] });

describe("Field operator", () => {
  it("should create query by chain", () => {
    const builtQuery = new SQBuilder().field(field).field(filed1).build();

    expect(builtQuery).toEqual(getFields(field, filed1));
  });

  it("should create query by array", () => {
    const builtQuery = new SQBuilder().fields([field, filed1]).build();

    expect(builtQuery).toEqual(getFields(field, filed1));
  });

  it("should merge same keys", () => {
    const builtQuery = new SQBuilder()
      .fields([field, filed1, field, filed1])
      .build();

    expect(builtQuery).toEqual(getFields(field, filed1));
  });

  it("should join query and merge same keys", () => {
    const query1 = new SQBuilder().fields([field]);
    const query2 = new SQBuilder().fields([filed1]);
    const query3 = new SQBuilder().fields([field]);

    const builtQuery = query1.joinFields(query2).joinFields(query3).build();

    expect(builtQuery).toEqual(getFields(field, filed1));
  });
});
