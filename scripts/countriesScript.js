import mongoose from "mongoose";
import axios from "axios";
import Culture from "../models/cultureModel.js";
import dotenv from "dotenv";
dotenv.config();

const { MONGO_URI } = process.env;

const run = async () => {
  try {
    await mongoose
      .connect(MONGO_URI)
      .then(console.log("Connected to MongoDB successfully"));
    const { data } = await axios.get("https://restcountries.com/v3.1/all");
    const cultures = data.map((c) => ({
      name: `${c.demonyms.eng.m} Culture`,
      country: c.name.common,
      continent: c.continents[0],
      religions: [],
      languages: Object.values(c.languages),
    }));

    cultures.forEach(async c => {
        const exists = await Culture.findOne({country: c.country})
        if(exists){
            console.log('Already created');
        }else{
            await Culture.create(c);
            console.log(`${c.country} created successfully`);
        }
    })
  } catch (error) {
    console.error(error);
  }
};

