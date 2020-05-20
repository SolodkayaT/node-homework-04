const { Router } = require("express");
const router = Router();
const authController = require("./auth.controller");

router.post(
  "/register",
  authController.validateUser,
  authController.registerUser
);
router.post("/login", authController.validateUser, authController.loginUser);
const authRouter = router;
module.exports = authRouter;
