import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },
    continent: {
      type: String,
      trim: true,
      maxLength: 10,
    },
    religions: [String],
    languages: [String],
  },
  { timestamps: true }
);

const Culture = model("Culture", schema);

export default Culture;
