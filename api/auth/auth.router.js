const { Router } = require("express");
const router = Router();
const authController = require("./auth.controller");

router.post(
  "/auth/register",
  authController.validateUser,
  authController.registerUser
);
router.post(
  "/auth/login",
  authController.validateUser,
  authController.loginUser
);

router.patch("/auth/logout", authController.authorize, authController.logOut);

router.get(
  "/users/current",
  authController.authorize,
  authController.getCurrentUser
);
const authRouter = router;
module.exports = authRouter;
