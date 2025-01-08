import EQBuilder from "../../src/experimental";

interface TestModel {
  id: string;
  name: string;
  description: string;
  options: string;
}

const singleType = new EQBuilder<TestModel>().field("id").buildTest();
const singleTypeId: "id" = singleType.fields[0];

const multipleTypes = new EQBuilder<TestModel>()
  .field("id")
  .field("name")
  .field("description")
  .buildTest();
const multipleTypeID: "id" = multipleTypes.fields[0];
const multipleTypeName: "name" = multipleTypes.fields[1];
const multipleTypeDescription: "description" = multipleTypes.fields[2];

const withUnionTypes = new EQBuilder<TestModel>()
  .field("id")
  .fields(["name", "description"])
  .field("options")
  .field("id")
  .buildTest();
const withUnionTypeName: "name" = withUnionTypes.fields[0];
const withUnionTypeDescription: "description" = withUnionTypes.fields[1];
const withUnionTypeOptions: "options" = withUnionTypes.fields[2];
const withUnionTypeID: "id" = withUnionTypes.fields[3];



const sortType = new EQBuilder<TestModel>().sort("id").asc().buildTest();