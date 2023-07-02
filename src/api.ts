import {
  ScanCommand,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall, marshall } from "@aws-sdk/util-dynamodb";
import { dbClient } from "../databaseSetup";
import uuid4 from "uuid4";
import { schema } from "./validation";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { handleError } from "./errorHandler";

const getAllProducts = async () => {
  const response = { statusCode: 200, body: "" };
  try {
    const { Items } = await dbClient.send(
      new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME })
    );
    response.body = JSON.stringify({
      message: "Success!!;)",
      data: Items!.map((item) => unmarshall(item)),
    });
  } catch (e) {
    return handleError(e);
  }
  return response;
};

const createProduct = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const response = { statusCode: 200, body: "" };
  try {
    const productRequest = JSON.parse(event.body as string);
    const productId = uuid4();
    productRequest.id = productId;
    await schema.validate(productRequest);
    const params: any = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(productRequest || {}),
    };
    const result = await dbClient.send(new PutItemCommand(params));
    response.body = JSON.stringify({
      message: "Success;)",
      result,
    });
  } catch (e) {
    return handleError(e);
  }
  return response;
};

const getProduct = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const response = { statusCode: 200, body: "" };
  try {
    const id = event.pathParameters?.id as string;
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ id: id }),
    };
    const result = await dbClient.send(new GetItemCommand(params));
    if (!result || !result.Item) {
      response.statusCode = 404;
    }
    response.body = JSON.stringify({
      message: result.Item ? "Success;)" : "Failed;(",
      data: result.Item ? unmarshall(result.Item) : "Product doesn't exist",
    });
  } catch (e) {
    return handleError(e);
  }
  return response;
};

const updateProduct = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const response = { statusCode: 200, body: "" };

  try {
    const body = JSON.parse(event.body as string);
    await schema.validate(body);
    const objKeys = Object.keys(body);
    const id = event.pathParameters?.id as string;
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ id: id }),
      UpdateExpression: `SET ${objKeys
        .map((_, index) => `#key${index} = :value${index}`)
        .join(", ")}`,
      ExpressionAttributeNames: objKeys.reduce(
        (acc, key, index) => ({
          ...acc,
          [`#key${index}`]: key,
        }),
        {}
      ),
      ExpressionAttributeValues: marshall(
        objKeys.reduce(
          (acc, key, index) => ({
            ...acc,
            [`:value${index}`]: body[key],
          }),
          {}
        )
      ),
    };
    const updateResult = await dbClient.send(new UpdateItemCommand(params));

    response.body = JSON.stringify({
      message: "Success;)",
      updateResult,
    });
  } catch (e) {
    return handleError(e);
  }
  return response;
};

const deleteProduct = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const response = { statusCode: 200, body: "" };

  try {
    const id = event.pathParameters?.id as string;
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ id: id }),
    };
    const deleteResult = await dbClient.send(new DeleteItemCommand(params));

    response.body = JSON.stringify({
      message: "Success;)",
      deleteResult,
    });
  } catch (e) {
    return handleError(e);
  }
  return response;
};

export {
  getAllProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
};
