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

      await authModel.updateUserById(existingUser._id, { token });
      return res.status(200).json({
        user: existingUser,
      });
    } catch (err) {
      next(err);
    }
  }

  async authorize(req, res, next) {
    try {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.replace("Bearer", "");
      console.log(token);
      try {
        await jwt.verify(token, ssjfdskvmdfkeself);
      } catch (err) {
        throw new Unauthorized("User is not authorized!");
      }
      const user = await authModel.findUserByToken(token);
      console.log("user", user);
      if (!user) {
        throw new Unauthorized("Token is not valid!");
      }
      req.user = user;
      req.token = token;
      next();
    } catch (err) {
      next(err);
    }
  }
  async logOut(req, res, next) {
    try {
      await authModel.updateUserById(req.user._id, { token: null });
      return res.status(204).json();
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
