const { getTopicsFromChapter } = require("../topic/topic.model");
const { getFaqsFromChapter } = require("../faq/faq.model");
const { getPracticeTestsFromChapter } = require("../test/test.model");
const { getChapterFromId } = require("../chapter/chapter.model");
const { checkIfSubscriptionIsAvailable } = require("../common/common.model");

function getChapter(chapter_id) {
  return new Promise((resolve, reject) => {
    getChapterFromId(chapter_id, (err, results) => {
      if (err) {
        reject("Error in chapter, please try again later");
      }

      resolve(results);
    });
  });
}

function getTopics(user_id, chapter_id) {
  return new Promise((resolve, reject) => {
    getTopicsFromChapter({ user_id, chapter_id }, (err, results) => {
      if (err) {
        reject("Error in topics, please try again later");
      }

      resolve(results);
    });
  });
}

function getFaqs(chapter_id) {
  return new Promise((resolve, reject) => {
    getFaqsFromChapter(chapter_id, (err, results) => {
      if (err) {
        reject("Error in faqs, please try again later");
      }

      resolve(results);
    });
  });
}

function getTests(chapter_id) {
  return new Promise((resolve, reject) => {
    getPracticeTestsFromChapter(chapter_id, (err, results) => {
      if (err) {
        reject("Error in faqs, please try again later");
      }

      resolve(results);
    });
  });
}

function checkForPayment(user_id, subject_ids) {
  return new Promise((resolve, reject) => {
    checkIfSubscriptionIsAvailable({ user_id, subject_ids }, (err, results) => {
      if (err) {
        reject("Error in Payment");
      }

      resolve(results);
    });
  });
}

module.exports = {
  getListings: async (req, res) => {
    const { chapter_id } = req.query;
    const { id: user_id } = req.decoded.result;

    try {
      var topics = await getTopics(user_id, chapter_id);
    } catch (e) {
      return res.json({
        success: 0,
        message: e
      });
    }

    try {
      var chapter = await getChapter(chapter_id);
    } catch (e) {
      return res.json({
        success: 0,
        message: e
      });
    }

    try {
      var faqs = await getFaqs(chapter_id);
    } catch (e) {
      return res.json({
        success: 0,
        message: e
      });
    }

    try {
      var tests = await getTests(chapter_id);
    } catch (e) {
      return res.json({
        success: 0,
        message: e
      });
    }

    var isSubscribled = false;

    try {
      var paymentExist = await checkForPayment(user_id, chapter.subject_id);
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
        chapter,
        topics,
        faqs,
        tests,
        isSubscribled
      }
    });
  }
};
