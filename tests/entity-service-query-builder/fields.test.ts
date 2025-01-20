import { EQBuilder } from "../../lib/cjs";

const field = "key1";
const filed1 = "key2";

const getFields = (key: string, key2: string) => ({ fields: [key, key2] });

describe("Field operator", () => {
  it("should create query by chain", () => {
    const builtQuery = new EQBuilder().field(field).field(filed1).build();

    expect(builtQuery).toEqual(getFields(field, filed1));
  });

  it("should create query by array", () => {
    const builtQuery = new EQBuilder().fields([field, filed1]).build();

    expect(builtQuery).toEqual(getFields(field, filed1));
  });

  it("should merge same keys", () => {
    const builtQuery = new EQBuilder()
      .fields([field, filed1, field, filed1])
      .build();

    expect(builtQuery).toEqual(getFields(field, filed1));
  });

  it("should join query and merge same keys", () => {
    const query1 = new EQBuilder().fields([field]);
    const query2 = new EQBuilder().fields([filed1]);
    const query3 = new EQBuilder().fields([field]);

    const builtQuery = query1.joinFields(query2).joinFields(query3).build();

    expect(builtQuery).toEqual(getFields(field, filed1));
  });
});
