import express from "express";
import Culture from "../models/cultureModel.js";
import Creature from "../models/creatureModel.js";
import Event from "../models/eventModel.js";
import { adminOnly, capitalize, requireAuth } from "../lib/helpers.js";

const router = express.Router();

//GET All cultures
router.get("/", async (req, res) => {
  const queryObj = req.query;
  const keys = Object.keys(queryObj);
  if (keys.length > 0 && !keys.includes("page")) {
    const query = capitalize(queryObj[keys[0]]);
    queryObj[keys[0]] = query;
  }
  try {
    if (keys.includes("page")) {
      const cultures = await Culture.paginate(req.query.page, 20, {
        name: 1,
      });
      return res.status(200).send(cultures);
    } else {
      const resources = await Culture.find(queryObj).sort({ name: 1 });
      const cultures = [];
      for (let i = 0; i < resources.length; i++) {
        const culture = resources[i].toObject();
        const total_creatures = await Creature.countDocuments({
          culture: culture._id,
        });
        cultures.push({
          ...culture,
          total_creatures,
        });
      }
      if(cultures.length === 0){
        return res.status(404).send('Not Found')
      }
      return res.status(200).send(cultures);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

//GET culture by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const resource = await Culture.findById(id);
    if (!resource) {
      return res.status(404).send("Not found");
    }
    const culture = resource.toObject();
    const creatures = await Creature.find({ culture: id });
    culture.creatures = creatures;
    const events = await Event.find({ culture: id });
    culture.events = events;
    return res.status(200).send(culture);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

////middleware to protect routes from normal users and only admin can access
router.use(requireAuth());
router.use(adminOnly());

//POST culture
router.post("/", async (req, res) => {
  if (!req.body) {
    return res.status(400).send("Send a valid culture");
  }
  try {
    const culture = await Culture.create(req.body);
    return res.status(201).send(culture);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

//PATCH culture by id
router.patch("/:id", async (req, res) => {
  const propCount = Object.keys(req.body).length;
  if (!req.body || propCount < 0) {
    return res.status(400).send("You should change at least one property");
  }
  const { id } = req.params;
  const newProperties = Object.entries(req.body);
  try {
    const culture = await Culture.findById(id);
    if (!culture) {
      return res.status(404).send("Not found");
    }
    newProperties.forEach(([key, value]) => {
      culture[key] = value;
    });
    await culture.save();
    const updatedCulture = await Culture.findById(id);
    const creatures = await Creature.find({ culture: id });
    updatedCulture.creatures = creatures;
    return res.status(200).send(updatedCulture);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

//DELETE culture by id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const culture = await Culture.findById(id);
    if (!culture) {
      return res.status(404).send("Not found");
    } else {
      await Culture.findByIdAndDelete(id);
      return res
        .status(200)
        .send(`Culture with id ${id} was successfully deleted`);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

export default router;
