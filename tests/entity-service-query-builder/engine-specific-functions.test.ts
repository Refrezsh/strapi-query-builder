import { EQBuilder } from "../../lib/cjs";

const pubState = { publicationState: "preview" };
const locale = { locale: "uk" };

describe("Utils function", () => {
  it("should publication state works", () => {
    const builtQuery = new EQBuilder().publicationState("preview").build();

    expect(builtQuery).toEqual(pubState);
  });

  it("should locale works for strapi service", () => {
    const builtQuery = new EQBuilder().locale("uk").build();

    expect(builtQuery).toEqual(locale);
  });
});
