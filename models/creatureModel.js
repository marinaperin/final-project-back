import { Schema, SchemaTypes, model } from "mongoose";

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    culture: {
      type: SchemaTypes.ObjectId,
      ref: "Culture",
      default: null,
    },
    type: {
      type: [String],
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
    traits: {
      type: [String],
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
    event: {
      type: SchemaTypes.ObjectId,
      ref: "Event",
      default: null,
    },
    img: String,
  },
  { timestamps: true }
);

schema.statics.paginate = async function (page, itemCount, sortOrder) {
  const skipCount = (page - 1) * itemCount;
  const total_results = await this.countDocuments();
  const total_pages = Math.ceil(total_results / itemCount);
  const results = await this.find()
    .sort(sortOrder)
    .skip(skipCount)
    .limit(itemCount)
    .populate('culture', 'name country')
    .populate('event', 'name');
  return { page, results, total_pages, total_results };
};

const Creature = model("Creature", schema);

export default Creature;
