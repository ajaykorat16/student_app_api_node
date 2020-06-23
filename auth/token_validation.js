const jwt = require("jsonwebtoken");

const { checkDeviceTokenIsExist, getUserByUserId } = require("../api/user/user.model");

module.exports = {
  checkToken: (req, res, next) => {
    let token = req.get("authorization");
    if (token) {
      // Remove Bearer from string
      token = token.slice(7);
      jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
          return res.status(403).json({
            success: 0,
            message: "Invalid Token..."
          });
        } else {
          const { device_token, id: user_id } = decoded.result;

          checkDeviceTokenIsExist({ device_token, user_id }, (err, results) => {
            if (!results) {
              return res.status(403).json({
                success: 0,
                message: "Invalid Token..."
              });
            }

            getUserByUserId(user_id, (err, results) => {
              if (!results.is_active) {
                return res.json({
                  success: 0,
                  message: "You are currently blocked by admin, Please contact support"
                });
              }

              req.decoded = decoded;
              next();
            });
          });
        }
      });
    } else {
      return res.status(403).json({
        success: 0,
        message: "Access Denied! Unauthorized User"
      });
    }
  },
  checkAdminToken: (req, res, next) => {
    let token = req.get("authorization");
    if (token) {
      // Remove Bearer from string
      token = token.slice(7);
      jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
          return res.status(403).json({
            success: 0,
            message: "Invalid Token..."
          });
        }
        req.decoded = decoded;
        next();
      });
    } else {
      return res.status(403).json({
        success: 0,
        message: "Access Denied! Unauthorized User"
      });
    }
  }
};
