const router = require("express").Router();
const { checkToken } = require("../../auth/token_validation");
const { getTestInfo, submitTest, getTestResult } = require("./test.controller");

router.get("/test", checkToken, getTestInfo);
router.get("/test_result", checkToken, getTestResult);
router.post("/test", checkToken, submitTest);

module.exports = router;
