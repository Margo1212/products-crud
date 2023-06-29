import {
  ScanCommand,
  PutItemCommand,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall, marshall } from "@aws-sdk/util-dynamodb";
import { dbClient } from "./databaseSetup.js";
import uuid4 from "uuid4";

const getAllProducts = async () => {
  const response = { statusCode: 200 };
  try {
    const { Items } = await dbClient.send(
      new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME })
    );
    response.body = JSON.stringify({
      message: "Success!!;)",
      data: Items.map((item) => unmarshall(item)),
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed;(",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};

const createProduct = async (event) => {
  const response = { statusCode: 200 };
  try {
    const productRequest = JSON.parse(event.body);
    const productId = uuid4();
    productRequest.id = productId;
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(productRequest || {}),
    };
    const result = await dbClient.send(new PutItemCommand(params));
    response.body = JSON.stringify({
      message: "Success;)",
      result,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed;(",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};

const getProduct = async (event) => {
  const response = { statusCode: 200 };
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ id: event.pathParameters.id }),
    };
    const { Item } = await dbClient.send(new GetItemCommand(params));
    console.log({ Item });
    response.body = JSON.stringify({
      message: "Success;)",
      data: Item ? unmarshall(Item) : {},
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed;(",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};

export { getAllProducts, createProduct, getProduct };
