import express from "express";
import Creature from "../models/creatureModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const creatures = await Creature.find()
      .sort({ name: -1 })
      .populate({ path: "culture", select: "name country" })
      .populate("event", "title");
    return res.status(200).send(creatures);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const creature = await Creature.findById(id)
      .populate("culture", "name country")
      .populate("event", "title");
    if (!creature) {
      return res.status(404).send("Not found");
    }
    return res.status(200).send(creature);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

router.post("/", async (req, res) => {
  if (!req.body) {
    return res.status(400).send("Send a valid creature");
  }
  try {
    const creature = await Creature.create(req.body);
    return res.status(201).send(creature);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

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
      .populate("event", "title");
    return res.status(200).send(updatedCreature);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

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
    return res.status(500).send("Server error");
  }
});

export default router;
