import express from "express";
import Event from "../models/eventModel.js";
import Creature from "../models/creatureModel.js";

const router = express.Router();

//GET All events
router.get("/", async (req, res) => {
  try {
    const resources = await Event.find().sort({ name: -1 });
    const events = [];
    for (let i = 0; i < resources.length; i++) {
      const event = resources[i].toObject();
      const total_creatures = await Creature.countDocuments({
        event: event._id,
      });
      events.push = {
        ...event,
        total_creatures,
      };
    }
    return res.status(200).send(events);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

//GET event by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const resource = await Event.findById(id).populate(
      "culture",
      "name country"
    );
    if (!resource) {
      return res.status(404).send("Not found");
    }
    const event = resource.toObject();
    const creatures = await Creature.find({ event: id });
    event.creatures = creatures;
    return res.status(200).send(event);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

//POST event
router.post("/", async (req, res) => {
  if (!req.body) {
    return res.status(400).send("Send a valid event");
  }
  try {
    const event = await Event.create(req.body);
    return res.status(201).send(event);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

//PATCH event by id
router.patch("/:id", async (req, res) => {
  const propCount = Object.keys(req.body).length;
  if (!req.body || propCount < 0) {
    return res.status(400).send("You should change at least one property");
  }
  const { id } = req.params;
  const newProperties = Object.entries(req.body);
  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).send("Not found");
    }
    newProperties.forEach(([key, value]) => {
      event[key] = value;
    });
    await event.save();
    const updatedEvent = await Event.findById(id).populate(
      "culture",
      "name country"
    );
    const creatures = await Creature.find({ event: id });
    updatedEvent.creatures = creatures;
    return res.status(200).send(updatedEvent);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error");
  }
});

//DELETE event by id
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
