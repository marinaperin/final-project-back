import express from "express";
import Creature from "../models/creatureModel.js";
import { adminOnly, capitalize } from "../lib/helpers.js";

const router = express.Router();

//GET All creatures
router.get("/", async (req, res) => {
  const queryObj = req.query;
  const keys = Object.keys(queryObj);
  if (keys.length > 0 && !keys.includes("page")) {
    const query = capitalize(queryObj[keys[0]]);
    queryObj[keys[0]] = query;
  }
  try {
    if (keys.includes("page")) {
      const creatures = await Creature.paginate(req.query.page, 20, {
        name: 1,
      });
      return res.status(200).send(creatures);
    } else {
      const creatures = await Creature.find(queryObj)
        .sort({ name: 1 })
        .populate({ path: "culture", select: "name country" })
        .populate("event", "name");
      return res.status(200).send(creatures);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
});

//GET single creature by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const creature = await Creature.findById(id)
      .populate("culture", "name country")
      .populate("event", "name type description first_mention");
    if (!creature) {
      return res.status(404).send("Not found");
    }
    return res.status(200).send(creature);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
});

//middleware to protect routes from normal users and only admin can access
/* router.use(adminOnly()); */

//POST creature
router.post("/", async (req, res) => {
  if (!req.body) {
    return res.status(400).send("Send a valid creature");
  }
  try {
    const creature = await Creature.create(req.body);
    return res.status(201).send(creature);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
});

//PATCH creature by id (prefer patch instead of put because it allows to change only a few properties and not all are needed)
router.patch("/:id", async (req, res) => {
  const propCount = Object.keys(req.body).length;
  if (!req.body || propCount < 0) {
    return res.status(400).send("You should change at least one property");
  }
  const { id } = req.params;
  const newProperties = Object.entries(req.body);
  try {
    const creature = await Creature.findById(id);
    if (!creature) {
      return res.status(404).send("Not found");
    }
    newProperties.forEach(([key, value]) => {
      creature[key] = value;
    });
    await creature.save();
    const updatedCreature = await Creature.findById(id)
      .populate("culture", "name country")
      .populate("event", "name");
    return res.status(200).send(updatedCreature);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
});

//DELETE creature by id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const creature = await Creature.findById(id);
    if (!creature) {
      return res.status(404).send("Not found");
    } else {
      await Creature.findByIdAndDelete(id);
      return res
        .status(200)
        .send(`Creature with id ${id} was successfully deleted`);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
});

export default router;
