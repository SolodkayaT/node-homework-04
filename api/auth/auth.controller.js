const Joi = require("joi");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const createControllerProxy = require("../helpers/controllerProxy");
const authModel = require("./auth.model");
const ConflictError = require("../helpers/error.constructor");
const Unauthorized = require("../helpers/error.constructor");

class AuthController {
  constructor() {
    this._saltRounds = 5;
  }
  async registerUser(req, res, next) {
    try {
      const { email, password } = req.body;

      const existingUser = await authModel.findUserByEmail(email);
      if (existingUser) {
        throw new ConflictError("Email in use");
      }
      const hashedPassword = await this.hashPassword(password);
      const createdUser = await authModel.createUser({
        ...req.body,
        password: hashedPassword,
      });
      return res.status(201).json({
        user: this.composeUserForResponse(createdUser),
      });
    } catch (err) {
      next(err);
    }
  }

  async loginUser(req, res, next) {
    try {
      const { email, password } = req.body;
      const existingUser = await authModel.findUserByEmail(email);
      if (!existingUser) {
        throw new Unauthorized("Email is wrong");
      }
      const isPasswordCorrect = await this.comparePasswordHash(
        password,
        existingUser.password
      );
      if (!isPasswordCorrect) {
        throw new Unauthorized("Password is wrong");
      }
      const token = this.createToken(existingUser._id);
      await authModel.updateUserById(existingUser, { token });
      console.log(existingUser);
      return res.status(200).json({
        existingUser,
        token,
      });
    } catch (err) {
      next(err);
    }
  }

  async validateUser(req, res, next) {
    const userRules = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });

    const result = Joi.validate(req.body, userRules);

    if (result.error) {
      return res.status(400).send({ message: `${result.error.message}` });
    }
    next();
  }

  async hashPassword(password) {
    return bcryptjs.hash(password, this._saltRounds);
  }

  async comparePasswordHash(password, passwordHash) {
    return bcryptjs.compare(password, passwordHash);
  }

  createToken(uid) {
    return jwt.sign({ uid }, process.env.JWT_SECRET);
  }
  composeUserForResponse(user) {
    return {
      id: user._id,
      email: user.email,
      subscription: user.subscription,
    };
  }
}
module.exports = createControllerProxy(new AuthController());
