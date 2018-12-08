const express = require("express");
const router = express.Router();
const flairController = require("../controllers/flairController");

router.get("/topics/:topicId/flair/new", flairController.new);
router.post("/topics/:topicId/flair/create", flairController.create);
router.post("/topics/:topicId/flair/:id/destroy", flairController.destroy);
router.get("/topics/:topicId/flair/:id/edit", flairController.edit);
router.post("/topics/:topicId/flair/:id/update", flairController.update);

module.exports = router;