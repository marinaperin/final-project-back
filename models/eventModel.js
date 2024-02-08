import { Schema, SchemaTypes, model } from "mongoose";
import Creature from "./creatureModel.js";

const schema = new Schema(
  {
    name: {
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
    img: String,
  },
  { timestamps: true }
);

schema.statics.paginate = async function (page, itemCount, sortOrder) {
  const skipCount = (page - 1) * itemCount;
  const total_results = await this.countDocuments();
  const total_pages = Math.ceil(total_results / itemCount);
  const resources = await this.find()
    .sort(sortOrder)
    .skip(skipCount)
    .limit(itemCount)
    .populate('culture', 'name country');
    const results = [];
    for (let i = 0; i < resources.length; i++) {
      const event = resources[i].toObject();
      const creatures = await Creature.find({
        event: event._id,
      }).select('name');
      results.push({
        ...event,
        creatures,
      });
    }
  return { page, results, total_pages, total_results };
};

const Event = model("Event", schema);

export default Event;
