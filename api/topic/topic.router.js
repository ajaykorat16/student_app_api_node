const router = require("express").Router();
const { checkToken } = require("../../auth/token_validation");
const {
  getCompletedTopics,
  getUnCompletedTopics,
  completeTopic,
} = require("./topic.controller");

router.get("/completed_topics", checkToken, getCompletedTopics);
router.get("/uncompleted_topics", checkToken, getUnCompletedTopics);
router.post("/complete_topic", checkToken, completeTopic);

module.exports = router;
