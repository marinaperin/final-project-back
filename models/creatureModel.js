import { Schema, SchemaTypes, model } from "mongoose";

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    culture: {
      type: [SchemaTypes.ObjectId],
      ref: "Culture",
      default: null,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    appearance: {
      type: String,
      trim: true,
    },
    first_mention: {
      type: String,
      trim: true,
    },
    legends: {
      type: String,
      trim: true,
    },
    events: {
      type: [SchemaTypes.ObjectId],
      ref: "Event",
      default: null,
    },
  },
  { timestamps: true }
);

schema.statics.findByProp = (prop, value) => {
  return this.find({ [prop]: value });
};

const Creature = model("Creature", schema);

export default Creature;
