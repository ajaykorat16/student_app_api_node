const { validationResult } = require("express-validator");
const { sendSms, sendEmail } = require("../../helper/helper");
const {
  create,
  createOtp,
  getUserByUserEmail,
  getUserByUserId,
  getUsers,
  deleteUser,
  checkOtp,
  deleteFromOtp,
  deleteUserOtp,
  updatePassword,
  getUserByUserPhone,
  addLoginCheck,
  loginCheck,
  updateLoginTime,
  logoutFromUserId
} = require("../user/user.model");
const { getStandardFromId } = require("../standard/standard.model");
const { hashSync, genSaltSync, compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");

function insertLoginCheck(device_token, user_id) {
  return new Promise((resolve, reject) => {
    addLoginCheck(device_token, user_id, (err, results) => {
      if (err) {
        reject("Error in add login check");
      }

      resolve(results);
    });
  });
}

function changeLoginTime(device_token, user_id) {
  return new Promise((resolve, reject) => {
    updateLoginTime(device_token, user_id, (err, results) => {
      if (err) {
        reject("Error in update login time");
      }

      resolve(results);
    });
  });
}

function deleteOtp(user_id) {
  return new Promise((resolve, reject) => {
    deleteFromOtp(user_id, (err, results) => {
      if (err) {
        reject("Error in delete");
      }

      resolve(results);
    });
  });
}

function deleteOnlyOtp(user_id) {
  return new Promise((resolve, reject) => {
    deleteUserOtp(user_id, (err, results) => {
      if (err) {
        reject("Error in delete");
      }

      resolve(results);
    });
  });
}

module.exports = {
  createUser: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: 0, errors: errors.array() });
    }

    const body = req.body;
    const salt = genSaltSync(10);
    body.password = hashSync(body.password, salt);

    create(body, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Error in create user"
        });
      }
      const insertId = results.insertId;
      const otp = Math.floor(100000 + Math.random() * 900000);

      // const otp = 112233;
      createOtp({ insertId, otp }, async (err, results) => {
        if (err) {
          return res.status(500).json({
            success: 0,
            message: "Error in otp"
          });
        }

        //Send OTP
        try {
          var otpresponse = await sendSms(
            body.phone,
            `Thanks for signup with D Learning your verification code is: ${otp}`,
            "DLearning"
          );

          return res.json({
            success: 1,
            message:
              "You registered successfully, please verify otp and start your journey"
          });
        } catch (e) {
          return res.status(500).json({
            success: 0,
            message: "User created but problem in send otp please try later"
          });
        }
      });
    });
  },
  login: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: 0, errors: errors.array() });
    }
    const body = req.body;
    getUserByUserPhone(body.phone, (err, results) => {
      if (err) {
        return res.json({
          success: 0,
          message: "Database issue please try again later"
        });
      }
      if (!results) {
        return res.json({
          success: 0,
          message: "You are not registered with us please register first"
        });
      }

      if (!results.is_active) {
        return res.json({
          success: 0,
          message: "You are currently blocked by admin, Please contact support"
        });
      }
      console.log(results);
      loginCheck(results.id, async (err, loginResult) => {
        const errHandler = err => {
          return res.json({
            success: 0,
            message: err
          });
        };

        if (!loginResult) {
          const insertLogin = await insertLoginCheck(
            body.device_token,
            results.id
          ).catch(errHandler);
        } else {
          if (loginResult.device_token == body.device_token) {
            const insertLogin = await changeLoginTime(
              body.device_token,
              results.id
            ).catch(errHandler);
          } else {
            return res.json({
              success: 0,
              message:
                "You have already login from another device, try to logout from there first"
            });
          }
        }

        const result = compareSync(body.password, results.password);
        if (result) {
          results.password = undefined;
          results.device_token = body.device_token;
          const jsontoken = sign({ result: results }, process.env.JWT_KEY, {
            expiresIn: "7 days"
          });
          if (results.isOTPverified == 0) {

            const { id: insertId, phone } = results;
            const otp = Math.floor(100000 + Math.random() * 900000);

            // Delete existing otp
            await deleteOnlyOtp(
              insertId,
            ).catch(errHandler);

            createOtp({ insertId, otp }, async (err, results) => {
              if (err) {
                return res.status(500).json({
                  success: 0,
                  message: "Error in otp"
                });
              }

              //Send OTP
              var otpresponse = await sendSms(
                phone,
                `Thanks for signup with D Learning your verification code is: ${otp}`,
                "DLearning"
              );
            });

          }
          return res.json({
            success: 1,
            message: "login successfully",
            token: jsontoken,
            data: results
          });
        } else {
          return res.json({
            success: 0,
            message: "Invalid email or password"
          });
        }
      });
    });
  },
  resetPassword: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: 0, errors: errors.array() });
    }

    const { email } = req.decoded.result;
    getUserByUserEmail(email, (err, results) => {
      //Check for existing password
      if (err) {
        return res.json({
          success: 0,
          message: "Database issue please try again later"
        });
      }

      const result = compareSync(req.body.current_password, results.password);
      if (result) {
        var newPassword = hashSync(req.body.new_password, genSaltSync(10));

        updatePassword({ email, newPassword }, 0, err => {
          if (err) {
            return res.json({
              success: 0,
              message: "Database issue please try again later"
            });
          }

          return res.json({
            success: 1,
            message: "Password reset succesfully"
          });
        });
      } else {
        return res.json({
          success: 0,
          message: "Your current password is invalid, please enter valid password"
        });
      }
    });
  },
  checkOtp: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: 0, errors: errors.array() });
    }

    const { phone, otp } = req.body;

    getUserByUserPhone(phone, (err, userResult) => {
      const { id: user_id } = userResult;
      checkOtp({ user_id, otp }, async (err, results) => {
        const errHandler = err => {
          return res.json({
            success: 0,
            message: err
          });
        };
        if (err) {
          return res.json({
            success: 0,
            message: "Database issue please try again later"
          });
        }
        if (!results) {
          return res.json({
            success: 0,
            message: "Invalid otp"
          });
        }
        await deleteOtp(
          user_id,
        ).catch(errHandler);

        return res.json({
          success: 1,
          message: "Verify sucessfully now you can login",
        });
      });
    });
  },
  forgotPassword: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: 0, errors: errors.array() });
    }
    const { phone } = req.body;
    getUserByUserPhone(phone, async (err, results) => {
      if (err) {
        return res.json({
          success: 0,
          message: "Database issue please try again later"
        });
      }
      if (!results) {
        return res.json({
          success: 0,
          message: "You are not registered with us, please register"
        });
      }
      const { email } = results;

      var tempPassword = Math.random()
        .toString(36)
        .slice(-8);
      var newPassword = hashSync(tempPassword, genSaltSync(10));

      // Send email
      try {
        await sendEmail(
          "dlearning.tech@gmail.com",
          email,
          "Thank you for forgot password request",
          `Hii, Your temparary password is <b>${tempPassword}</b> Please reset this password once you login, Thanks`
        );

        updatePassword({ email, newPassword }, 1, (err, results) => {
          if (err) {
            return res.json({
              success: 0,
              message: "Database issue please try again later"
            });
          }

          return res.json({
            success: 1,
            message: "New temporary password sent to your email",
            data: results
          });
        });
      } catch (e) {
        return res.json({
          success: 0,
          message: "Email sending fail, please try after."
        });
      }
    });
  },
  getUserByUserId: (req, res) => {
    const id = req.params.id;
    getUserByUserId(id, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      if (!results) {
        return res.json({
          success: 0,
          message: "Record not Found"
        });
      }
      results.password = undefined;
      return res.json({
        success: 1,
        data: results
      });
    });
  },
  getUsers: (req, res) => {
    getUsers((err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      return res.json({
        success: 1,
        data: results
      });
    });
  },
  deleteUser: (req, res) => {
    const data = req.body;
    deleteUser(data, (err, results) => {
      if (err) {
        console.log(err);
        return;
      }
      if (!results) {
        return res.json({
          success: 0,
          message: "Record Not Found"
        });
      }
      return res.json({
        success: 1,
        message: "user deleted successfully"
      });
    });
  },
  logout: (req, res) => {
    const { phone } = req.body;
    getUserByUserPhone(phone, (err, userResult) => {

      if (typeof userResult == 'undefined') {
        return res.status(404).json({
          success: 0,
          message: "This phone is not available in the system"
        });
      }

      const { id: user_id } = userResult;
      logoutFromUserId(user_id, (err, results) => {
        return res.json({
          success: 1,
          message: "You are signed out successfully"
        });
      });
    });
  },
  resendOtp: (req, res) => {
    const { phone } = req.body;
    const errHandler = err => {
      return res.json({
        success: 0,
        message: err
      });
    };
    getUserByUserPhone(phone, async (err, userResult) => {

      if (typeof userResult == 'undefined') {
        return res.status(404).json({
          success: 0,
          message: "This phone is not available in te system"
        });
      }

      const { id: insertId } = userResult;
      const otp = Math.floor(100000 + Math.random() * 900000);

      // Delete existing otp
      await deleteOtp(
        insertId,
      ).catch(errHandler);

      createOtp({ insertId, otp }, async (err, results) => {
        if (err) {
          return res.status(500).json({
            success: 0,
            message: "Error in otp"
          });
        }

        //Send OTP
        try {
          var otpresponse = await sendSms(
            phone,
            `Thanks for signup with D Learning your verification code is: ${otp}`,
            "DLearning"
          );

          return res.json({
            success: 1,
            message:
              "New otp has been sended successfully, please check your inbox."
          });
        } catch (e) {
          console.log(e);

          return res.status(500).json({
            success: 0,
            message: "Problem in resend opt please try again later"
          });
        }
      });


    });
  }
};
