const router = require("express").Router();
const { checkToken } = require("../../auth/token_validation");
const {
  getListings,
  getHomePage,
  postReview,
  getDemoVideo,
  postSchoolResult,
  makePayment,
  paytmTransaction,
  getSchoolResult,
  currentUser
} = require("./common.controller");

router.get("/verify_login_token", checkToken, currentUser);
router.get("/listings", getListings);
router.get("/homepage", checkToken, getHomePage);
router.get("/demo_video", checkToken, getDemoVideo);
router.get("/school_result", checkToken, getSchoolResult);
router.post("/reviews", checkToken, postReview);
router.post("/school_result", checkToken, postSchoolResult);
router.post("/make_payment", checkToken, makePayment);
router.post("/paytm_transation", checkToken, paytmTransaction);

module.exports = router;
