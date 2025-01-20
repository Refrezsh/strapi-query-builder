import { EQBuilder } from "../../lib/cjs";

const emptyObject = {};

describe("Empty operators", () => {
  it("should be empty for logical filters", () => {
    const query = new EQBuilder().or().and().not().build();
    expect(query).toEqual(emptyObject);
  });
});
