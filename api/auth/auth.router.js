const { Router } = require("express");
const router = Router();
const authController = require("./auth.controller");

router.post(
  "/register",
  authController.validateUser,
  authController.registerUser
);
router.post("/login", authController.validateUser, authController.loginUser);

router.patch("/logout", authController.authorize, authController.logOut);

const authRouter = router;
module.exports = authRouter;
