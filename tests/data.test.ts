import SQBuilder from "../lib/cjs";

const dataObject = { key: "value", data: ["value2"] };

describe("Data", () => {
  it("should be data", () => {
    const query = new SQBuilder().data(dataObject).build();
    expect(query.data).toEqual(dataObject);
  });
});
