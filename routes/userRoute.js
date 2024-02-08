import express from "express";
import User from "../models/userModel.js";
import Creature from "../models/creatureModel.js";
import { createToken } from "../lib/helpers.js";

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
    return res.status(201).send("User created successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
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
    return res.status(202).send("User logged in successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
});

//GET user by id
router.get("/favorites", async (req, res) => {
  const { id } = req.user;
  try {
    const creatures = [];
    req.user.favorites.forEach(async (f) => {
      const creature = await Creature.findOne({ id: id });
      creatures.push({
        ...creatures,
        creature,
      });
    });
    return res.status(200).send(creatures);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
});

//PATCH user by id
router.patch("/:id", async (req, res) => {
  const { id } = req.user;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send("User not found");
    } else {
      user.favorites.push(...user.favorites, req.body);
      await user.save();
      return res.status(200).send("Added to favorites successfully");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
});

export default router;
