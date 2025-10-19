const express = require("express");
const { register, login, getAllUser, getUserById, updateUser, deleteUser} = require("../controllers/auth.controller");

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.get("/get-all-user", getAllUser);
router.get("/user/:id", getUserById);
router.put('/user/:id', updateUser);
router.delete('/user/:id', deleteUser);

module.exports = router;
