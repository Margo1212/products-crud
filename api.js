import {
  ScanCommand,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall, marshall } from "@aws-sdk/util-dynamodb";
import { dbClient } from "./databaseSetup.js";
import uuid4 from "uuid4";
import * as yup from "yup";

const schema = yup.object().shape({
  name: yup.string().required(),
  model: yup.string().required(),
  price: yup.number().required(),
});

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
    return handleError(e);
  }
  return response;
};

const createProduct = async (event) => {
  const response = { statusCode: 200 };
  try {
    const productRequest = JSON.parse(event.body);
    const productId = uuid4();
    productRequest.id = productId;
    await schema.validate(productRequest);
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
    return handleError(e);
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
    return handleError(e);
  }
  return response;
};

const updateProduct = async (event) => {
  const response = { statusCode: 200 };

  try {
    const body = JSON.parse(event.body);
    await schema.validate(body);
    const objKeys = Object.keys(body);
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ id: event.pathParameters.id }),
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

const deleteProduct = async (event) => {
  const response = { statusCode: 200 };

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ postId: event.pathParameters.postId }),
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

const handleError = (e) => {
  if (e instanceof yup.ValidationError) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Failed;(",
        errors: e.errors,
      }),
    };
  }
  if (e) {
    return {
      statusCode: e.statusCode,
      body: JSON.stringify({
        message: "Failed;(",
        errorMsg: e.message,
        errorStack: e.stack,
      }),
    };
  }
  throw e;
};

export {
  getAllProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
};
