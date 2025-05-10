const router = require('express').Router();

const {
    createUser,
    deleteUser,
    getAllUsers,
    getUserById,
    updateUser,
  } = require("../controllers/userController.js");
  

router.get("/user", getAllUsers);
router.get("/user/:id", getUserById);
router.post("/user", createUser);
router.put("/user/:id", updateUser);
router.delete("/user/:id", deleteUser);

module.exports = router; 