import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { dbClient } from "./databaseSetup.js";

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

export { getAllProducts };
