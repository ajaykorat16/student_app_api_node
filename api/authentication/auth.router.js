const router = require("express").Router();
const { check } = require("express-validator");
const { checkToken } = require("../../auth/token_validation");
const {
  createUser,
  login,
  checkOtp,
  forgotPassword,
  resetPassword,
  logout,
  resendOtp
} = require("./auth.controller");
const {
  getUserByUserEmail,
  getUserByUserPhone
} = require("../user/user.model");

const { getStandardFromId } = require("../standard/standard.model");

router.post(
  "/register",
  [
    check("email")
      .not()
      .isEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is not valid")
      .custom((value, { req }) => {
        return new Promise((resolve, reject) => {
          getUserByUserEmail(req.body.email, (err, results) => {
            if (err) {
              reject(new Error("Server Error"));
            }
            if (Boolean(results)) {
              reject(new Error("E-mail already in use"));
            }
            resolve(true);
          });
        });
      }),
    check("standard_id").custom((value, { req }) => {
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
    check("password")
      .not()
      .isEmpty()
      .withMessage("Password is required")
      .isLength({ min: 5 })
      .withMessage("Min 5 char"),
    check("first_name")
      .not()
      .isEmpty()
      .withMessage("First Name is required"),
    check("phone")
      .not()
      .isEmpty()
      .withMessage("Phone is required")
      .isMobilePhone()
      .withMessage("Phone not valid")
      .custom((value, { req }) => {
        return new Promise((resolve, reject) => {
          getUserByUserPhone(req.body.phone, (err, results) => {
            if (err) {
              reject(new Error("Server Error"));
            }
            if (Boolean(results)) {
              reject(new Error("Phone already in use"));
            }
            resolve(true);
          });
        });
      }),
    check("type")
      .not()
      .isEmpty()
      .withMessage("Type is required: (Student, Parent, Gaurdian)"),
  ],
  createUser
);
router.post("/login", login);
router.post(
  "/verify_otp",
  [
    check("phone")
      .not()
      .isEmpty()
      .withMessage("User id is required"),
    check("otp")
      .not()
      .isEmpty()
      .withMessage("Otp is required")
  ],
  checkOtp
);
router.post(
  "/forgot_password",
  [
    check("phone")
      .not()
      .isEmpty()
      .withMessage("Phone is required")
  ],
  forgotPassword
);
router.post(
  "/change_password",
  [
    checkToken,
    check("current_password")
      .not()
      .isEmpty()
      .withMessage("Current Password is required"),
    check("new_password")
      .not()
      .isEmpty()
      .withMessage("Password is required")
      .isLength({ min: 5 })
      .withMessage("Min 5 of password is required")
  ],
  resetPassword
);
router.post("/resend_otp", resendOtp);
router.post("/logout", logout);

module.exports = router;
