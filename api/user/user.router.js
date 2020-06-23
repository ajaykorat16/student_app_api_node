const router = require("express").Router();
const { check } = require("express-validator");
const { checkToken } = require("../../auth/token_validation");
const { getProfile, updateProfile } = require("./user.controller");

const { getStandardFromId } = require("../standard/standard.model");

router.get("/profile", checkToken, getProfile);
router.post(
  "/profile",
  [
    check("first_name").not().isEmpty().withMessage("First name is required"),
    check("phone").not().isEmpty().withMessage("Phone is required"),
    check("type")
      .not()
      .isEmpty()
      .withMessage("Type occupation is required"),
    check("gender").not().isEmpty().withMessage("Gender is required"),
    check("city").not().isEmpty().withMessage("City is required"),
    check("email")
      .not()
      .isEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is not valid"),
    check("standard_id").not().isEmpty().withMessage("Standard is required").custom((value, { req }) => {
      return new Promise((resolve, reject) => {
        getStandardFromId(req.body.standard_id, (err, results) => {
          if (err) {
            reject(new Error("Server Error"));
          }
          if (Boolean(results)) {
            resolve(true);
          }
          reject(new Error("Standard is not exist"));
        });
      });
    }),
  ],
  checkToken,
  updateProfile
);

module.exports = router;
