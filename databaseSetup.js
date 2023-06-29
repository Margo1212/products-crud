import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const REGION = "eu-north-1";
const dbClient = new DynamoDBClient({ region: REGION });

export { dbClient };
