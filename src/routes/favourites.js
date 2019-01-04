const express = require("express");
const router = express.Router();
const favouriteController = require("../controllers/favouriteController");

router.post("/topics/:topicId/posts/:postId/favourites/create",
    favouriteController.create);
router.post("/topics/:topicId/posts/:postId/favourites/:id/destroy",
    favouriteController.destroy);

module.exports = router;