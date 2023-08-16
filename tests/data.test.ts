import SQBuilder from "../lib/cjs";

const dataObject = { key: "value", data: ["value2"] };

describe("Data operator", () => {
  it("should be same as input", () => {
    const query = new SQBuilder().data(dataObject).build();
    expect(query.data).toEqual(dataObject);
  });
});
