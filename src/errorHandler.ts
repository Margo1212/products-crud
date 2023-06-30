import * as yup from "yup";
import httpErrors from "http-errors";

export const handleError = (e: unknown) => {
  if (e instanceof yup.ValidationError) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Failed;(",
        errors: e.errors,
      }),
    };
  }
  if (e instanceof httpErrors.HttpError) {
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
