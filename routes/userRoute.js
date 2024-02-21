import express from "express";
import User from "../models/userModel.js";
import Creature from "../models/creatureModel.js";
import { createToken } from "../lib/helpers.js";
import { requireAuth } from "../lib/helpers.js";

const router = express.Router();

//POST signUp
router.post("/sign-up", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Invalid email or password");
  }
  try {
    const user = await User.signUp(email, password);
    const token = createToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(201).send(user.resUser());
  } catch (error) {
    console.error(error);
    return res.status(error.statusCode).send(error);
  }
});

//POST logIn
router.post("/log-in", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Invalid email or password");
  }
  try {
    const user = await User.logIn(email, password);
    const token = createToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(202).send(user.resUser());
  } catch (error) {
    console.error(error);
    return res.status(error.statusCode).send(error);
  }
});

//middleware authorization
router.use(requireAuth());

//GET user favorites
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const creatures = [];
    const user = await User.findById(id);
    for (let i = 0; i < user.favorites.length; i++) {
      const creature = await Creature.findById(user.favorites[i].toString());
      creatures.push(creature);
    }
    return res.status(200).send(creatures);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

//PATCH user favorites by id
router.patch("/favorites", async (req, res) => {
  const { id, action, userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    } else {
      if (action === "add") {
        if (user.favorites.includes(id)) {
          return res.status(400).send("Already added");
        } else {
          user.favorites.push(id);
          await user.save();
          const userToSend = await User.findById(userId);
          return res.status(200).send(userToSend.resUser());
        }
      } else if (action === "remove") {
        user.favorites.splice(user.favorites.indexOf(id), 1);
        await user.save();
        const userToSend = await User.findById(userId);
        return res.status(200).send(userToSend.resUser());
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

export default router;
