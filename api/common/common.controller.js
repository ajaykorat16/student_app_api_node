const https = require('https');
const {
  getStandards,
  getStandardFromId,
  checkStandrardWithSubject
} = require("../standard/standard.model");
const {
  getSubjects,
  getSubjectsFromStandardId
} = require("../subject/subject.model");
const { getChaptersFromSubjectId } = require("../chapter/chapter.model");
const { getMockTestsFromSubject } = require("../test/test.model");
const {
  postReview,
  demoVideo,
  schoolResult,
  postSubscription,
  checkIfSubscriptionIsAvailable,
  listSchoolResults
} = require("../common/common.model");

function standard() {
  return new Promise((resolve, reject) => {
    getStandards((err, results) => {
      if (err) {
        reject("Error in standards");
      }

      resolve(results);
    });
  });
}

function subject() {
  return new Promise((resolve, reject) => {
    getSubjects((err, results) => {
      if (err) {
        reject("Error in Subjects");
      }

      resolve(results);
    });
  });
}

function checkExistingSubscription(user_id, subject_ids) {
  return new Promise((resolve, reject) => {
    checkIfSubscriptionIsAvailable({ user_id, subject_ids }, (err, results) => {
      if (err) {
        reject("Error in Subjects");
      }

      resolve(results);
    });
  });
}

module.exports = {
  getListings: async (req, res) => {
    const { listing_type } = req.query;

    if (typeof listing_type === "undefined") {
      const standards = await standard();
      const subjects = await subject();

      return res.json({
        success: 1,
        message: "Your request went through successfully",
        data: {
          standards,
          subjects
        }
      });
    }

    var responseData = [];
    switch (listing_type) {
      case "standard":
        responseData = await standard();
        break;
      case "subject":
        responseData = await subject();
        break;
      default:
        return res.json({
          success: 0,
          message: "Please provide proper listing type"
        });
    }

    return res.json({
      success: 1,
      message: "Your request went through successfully",
      data: responseData
    });
  },
  getHomePage: (req, res) => {
    const { default_subject: subject_id, standard_id } = req.query;
    const { id: user_id, first_name, last_name } = req.decoded.result;

    getStandardFromId(standard_id, (err, results) => {
      if (err) {
        return res.json({
          success: 0,
          message: "Database issue please try again later"
        });
      }
      if (typeof results == 'undefined') {
        return res.json({
          success: 1,
          message: "Your standard is not active please, contact support",
          data: {
            name: `${first_name} ${last_name}`,
            standard: [],
            subjects: [],
            chapters: [],
            test: [],
            isSubscribled: false
          }
        });
      }
      const { name: standard } = results;
      checkStandrardWithSubject(standard_id, subject_id, (err, results) => {
        if (err) {
          return res.json({
            success: 0,
            message: "Database issue please try again later"
          });
        }
        if (results.length == 0) {
          return res.json({
            success: 1,
            message: "Your request went through successfully",
            data: {
              name: `${first_name} ${last_name}`,
              standard,
              subjects: [],
              chapters: [],
              test: [],
              isSubscribled: false
            }
          });
        }
        getSubjectsFromStandardId(standard_id, (err, results) => {
          if (err) {
            return res.json({
              success: 0,
              message: "Database issue please try again later"
            });
          }
          const subjects = results;
          getChaptersFromSubjectId(subject_id, (err, results) => {
            if (err) {
              return res.json({
                success: 0,
                message: "Database issue please try again later"
              });
            }
            const chapters = results;
            getMockTestsFromSubject(subject_id, async (err, results) => {
              if (err) {
                return res.json({
                  success: 0,
                  message: "Database issue please try again later"
                });
              }
              var isSubscribled = false;

              try {
                var paymentExist = await checkExistingSubscription(user_id, subject_id);
                if (paymentExist.length > 0) {
                  isSubscribled = true;
                }
              } catch (e) {
                return res.json({
                  success: 0,
                  message: e
                });
              }

              return res.json({
                success: 1,
                message: "Your request went through successfully",
                data: {
                  name: `${first_name} ${last_name}`,
                  standard,
                  subjects,
                  chapters,
                  test: results,
                  isSubscribled
                }
              });
            });
          });
        });
      });
    });
  },
  postReview: (req, res) => {
    const { id: user_id } = req.decoded.result;
    const { ratings, comment } = req.body;

    postReview({ user_id, ratings, comment }, err => {
      if (err) {
        return res.json({
          success: 0,
          message: "Database issue please try again later"
        });
      }
      return res.json({
        success: 1,
        message: "Your review posted successfully"
      });
    });
  },
  getDemoVideo: (req, res) => {
    demoVideo((err, result) => {
      if (err) {
        return res.json({
          success: 0,
          message: "Database issue please try again later"
        });
      }
      return res.json({
        success: 1,
        data: result,
        message: "You found demo video sucessfully"
      });
    });
  },
  makePayment: async (req, res) => {
    const { id: user_id } = req.decoded.result;
    const { subject_ids, transaction_id, amount, promocode } = req.body;

    const existingSubsription = await checkExistingSubscription(
      user_id,
      subject_ids
    );

    if (existingSubsription.length > 0) {
      return res.json({
        success: 0,
        data:
          "You already purchased subsription for one of this subject please check for that"
      });
    }
    const subscription_info = subject_ids.split(",").map(subject_id => {
      return [user_id, subject_id, transaction_id, amount, promocode];
    });

    postSubscription(subscription_info, err => {
      if (err) {
        return res.json({
          success: 0,
          message: "Database issue please try again later"
        });
      }
      return res.json({
        success: 1,
        message: "Subscription added successfully"
      });
    });
  },
  postSchoolResult: (req, res) => {
    const { id: user_id } = req.decoded.result;
    const { standard_id, subject_id, school_name, term, marks, city } = req.body;

    schoolResult(
      { user_id, standard_id, subject_id, school_name, term, marks, city },
      err => {
        if (err) {
          return res.json({
            success: 0,
            message: "Database issue please try again later"
          });
        }
        return res.json({
          success: 1,
          message: "Your school result posted successfully"
        });
      }
    );
  },
  paytmTransaction: (req, res) => {

    const { URL, MID, WEBSITE, MERCHANT_KEY } = process.env;
    const { id: user_id } = req.decoded.result;
    const { amount } = req.body;
    const order_id = Math.floor(Math.random(1000000) * 1000000);
    const checksum_lib = require('../../paytm/checksum');
    var paytmParams = {};

    paytmParams.body = {
      "requestType": "Payment",
      "mid": MID,
      "websiteName": WEBSITE,
      "orderId": order_id,
      "callbackUrl": `https://securegw.paytm.in/theia/paytmCallback?ORDER_ID=${order_id}`,
      "txnAmount": {
        "value": amount,
        "currency": "INR",
      },
      "userInfo": {
        "custId": user_id,
      }
      // "enablePaymentMode":
      //   [
      //     { mode: "UPI", channels: ["UPIPUSH"] },
      //     { mode: "PAYTM_DIGITAL_CREDIT", channels: ["UPIPUSH"] },
      //     { mode: "CREDIT_CARD", channels: ["VISA", "MASTER"] },
      //     { mode: "DEBIT_CARD", channels: ["VISA", "MASTER"] },
      //     { mode: "NET_BANKING", channels: ["SBI", "PNB", , "HDFC", "ICICI"] },
      //     { mode: "PPBL" },
      //     { mode: "BALANCE" },
      //     { mode: "EMI" },
      //   ]
    };

    checksum_lib.genchecksumbystring(JSON.stringify(paytmParams.body), MERCHANT_KEY, function (err, checksum) {
      paytmParams.head = {
        "signature": checksum
      };
      var post_data = JSON.stringify(paytmParams);

      var options = {
        hostname: URL,
        port: 443,
        path: `/theia/api/v1/initiateTransaction?mid=${MID}&orderId=${order_id}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': post_data.length
        }
      };

      var response = "";
      var post_req = https.request(options, function (post_res) {
        post_res.on('data', function (chunk) {
          response += chunk;
        });

        post_res.on('end', function () {
          return res.json({ response: JSON.parse(response), orderId: order_id })
        });
      });

      post_req.write(post_data);
      post_req.end();
    });
  },
  getSchoolResult: (req, res) => {
    const { id: user_id } = req.decoded.result;

    listSchoolResults(user_id, (err, result) => {
      if (err) {
        return res.json({
          success: 0,
          message: "Database issue please try again later"
        });
      }
      return res.json({
        success: 1,
        message: "You get school result successfully",
        data: result
      });
    });
  },
  currentUser: (req, res) => {
    return res.json({
      success: 1,
      data: req.decoded
    });
  }
};
