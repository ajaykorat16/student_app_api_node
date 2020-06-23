const { getUserByUserId, updateUserById } = require("../user/user.model");
const { validationResult } = require("express-validator");

module.exports = {
  getProfile: (req, res) => {
    const { id } = req.decoded.result;

    getUserByUserId(id, (err, results) => {
      if (err) {
        // console.log(err);

        return res.json({
          success: 0,
          message: "Database issue please try again later",
        });
      }
      return res.json({
        success: 1,
        message: "You got profile successfully",
        data: results,
      });
    });
  },
  updateProfile: (req, res) => {
    const { id } = req.decoded.result;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: 0, errors: errors.array() });
    }

    updateUserById(id, req.body, (err, results) => {
      if (err) {
        return res.json({
          success: 0,
          message: "Make sure you are using unique phone and email",
        });
      }
      return res.json({
        success: 1,
        message: "Your profile updated sucessfully",
      });
    });
  }
};
