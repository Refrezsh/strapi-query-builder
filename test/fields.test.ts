import { SQBuilder } from "../builder/sq-builder";

const field = "key1";
const filed1 = "key2";

const getFields = (key: string, key2: string) => ({ fields: [key, key2] });

describe("Fields query", () => {
  it("chain", () => {
    const query = new SQBuilder().fields(field).fields(filed1).build();

    expect(query).toEqual(getFields(field, filed1));
  });

  it("array", () => {
    const query = new SQBuilder().fields([field, filed1]).build();

    expect(query).toEqual(getFields(field, filed1));
  });

  it("same keys", () => {
    const query = new SQBuilder()
      .fields([field, filed1, field, filed1])
      .build();

    expect(query).toEqual(getFields(field, filed1));
  });

  it("merging", () => {
    const query1 = new SQBuilder().fields([field]);

    const query2 = new SQBuilder().fields([filed1]);

    const query3 = new SQBuilder().fields([field]);

    const query = query1.joinFields(query2).joinFields(query3).build();

    expect(query).toEqual(getFields(field, filed1));
  });
});
