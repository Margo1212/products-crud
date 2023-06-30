import * as yup from "yup";

export const schema = yup.object().shape({
  name: yup.string().required().strict(),
  model: yup.string().required().strict(),
  price: yup.number().positive().integer().required().strict(),
});
