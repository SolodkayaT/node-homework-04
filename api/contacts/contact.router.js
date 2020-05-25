const { Router } = require("express");
const ContactController = require("./contact.controller");
const contactRouter = Router();

contactRouter.get("/", ContactController.listContacts);
contactRouter.get("/:id", ContactController.getContact);

contactRouter.post(
  "/",
  ContactController.validateCreateContact,
  ContactController.addContact
);

contactRouter.patch(
  "/:id",
  ContactController.validateUpdateContact,
  ContactController.updateContact
);

contactRouter.delete("/:id", ContactController.removeContact);

module.exports = contactRouter;
