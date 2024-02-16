import { Schema, model } from "mongoose";
import Creature from "./creatureModel.js";

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
      required: true,
      trim: true,
      maxLength: 20,
    },
    religions: [String],
    languages: [String],
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
    .limit(itemCount);
  const results = [];
  for (let i = 0; i < resources.length; i++) {
    const culture = resources[i].toObject();
    const total_creatures = await Creature.countDocuments({
      culture: culture._id,
    });
    results.push({
      ...culture,
      total_creatures,
    });
  }
  return { page, results, total_pages, total_results };
};

const Culture = model("Culture", schema);

export default Culture;
