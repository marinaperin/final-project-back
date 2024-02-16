import express from "express";
import Event from "../models/eventModel.js";
import Creature from "../models/creatureModel.js";
import { adminOnly, capitalize } from "../lib/helpers.js";

const router = express.Router();

//GET All events
router.get("/", async (req, res) => {
  const queryObj = req.query;
  const keys = Object.keys(queryObj);
  if (keys.length > 0 && !keys.includes("page")) {
    const query = capitalize(queryObj[keys[0]]);
    queryObj[keys] = query;
  }
  try {
    if (keys.includes("page")) {
      const events = await Event.paginate(req.query.page, 20, {
        name: 1,
      });
      return res.status(200).send(events);
    } else {
      const resources = await Event.find(queryObj)
        .sort({ name: 1 })
        .populate("culture", "name country");
      const events = [];
      for (let i = 0; i < resources.length; i++) {
        const event = resources[i].toObject();
        const creatures = await Creature.find({
          event: event._id,
        }).select("name");
        events.push({
          ...event,
          creatures,
        });
      }
      return res.status(200).send(events);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
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
    return res.status(500).send(error.message);
  }
});

//middleware to protect routes from normal users and only admin can access
router.use(adminOnly());

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
    return res.status(500).send(error.message);
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
    return res.status(500).send(error.message);
  }
});

//DELETE event by id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).send("Not found");
    } else {
      await Event.findByIdAndDelete(id);
      return res
        .status(200)
        .send(`Event with id ${id} was successfully deleted`);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
});

export default router;
