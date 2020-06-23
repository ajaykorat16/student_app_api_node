const router = require("express").Router();
const { checkToken } = require("../../auth/token_validation");
const { getListings } = require("./chapter.controller");

router.get("/topics_and_faqs", checkToken, getListings);

module.exports = router;
