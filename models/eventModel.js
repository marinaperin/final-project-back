import { Schema, SchemaTypes, model } from "mongoose";

const schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },
    description: {
      type: String,
      trim: true,
    },
    date: [String],
    first_mention: {
      type: String,
      trim: true,
    },
    culture: {
      type: SchemaTypes.ObjectId,
      ref: "Culture",
      default: null,
    },
  },
  { timestamps: true }
);

const Event = model("Event", schema);

export default Event;
