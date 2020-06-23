const {
  getTestsFromId,
  getQuestionsFromTestId,
  getQuestionsFromTestIdForResult,
  insertTestResult,
  getResultOfTest,
  deleteTestResultIfExist,
  getSubmitedTestsByUser,
  getSubjectFromTest,
  getchaptersAndTopicsFromTest
} = require("./test.model");

const { getSubscribedSubjectFromUser } = require("../common/common.model")

function getTest(test_id) {
  return new Promise((resolve, reject) => {
    getTestsFromId(test_id, (err, results) => {
      if (err) {
        reject("Error in tests, please try again later");
      }

      resolve(results);
    });
  });
}

function getTestQuestions(test_id) {
  return new Promise((resolve, reject) => {
    getQuestionsFromTestId(test_id, (err, results) => {
      if (err) {
        reject("Error in questions, please try again later");
      }

      resolve(results);
    });
  });
}

function getResult(body, user_id) {
  return new Promise((resolve, reject) => {
    const { test_id, answers } = body;

    getQuestionsFromTestIdForResult(test_id, (err, results) => {
      if (err) {
        reject("Error in result, please try again later");
      }

      var finalResult = results.map(function (value) {
        const { question_id, answer, marks } = value;

        let questionAnswer = answers.find(
          answer => answer.question_id === question_id
        );

        if (questionAnswer.answer.toLowerCase() == answer.toLowerCase()) {
          return [
            user_id,
            test_id,
            question_id,
            questionAnswer.answer,
            1,
            marks
          ];
        }

        return [user_id, test_id, question_id, questionAnswer.answer, 0, 0];
      });
      resolve(finalResult);
    });
  });
}

function getSubscribedSubject(user_id) {
  return new Promise((resolve, reject) => {
    getSubscribedSubjectFromUser(user_id, (err, results) => {
      if (err) {
        reject("Error in subsribed subjects, please try again later");
      }

      resolve(results);
    });
  });
}

function getSubmitedTests(user_id) {
  return new Promise((resolve, reject) => {
    getSubmitedTestsByUser(user_id, (err, results) => {
      if (err) {
        reject("Error in submited, please try again later");
      }

      resolve(results);
    });
  });
}

function subjectFromTest(test_id) {
  return new Promise((resolve, reject) => {
    getSubjectFromTest(test_id, (err, subjectResult) => {
      if (err) {
        reject('Error in test result')
      }
      resolve(subjectResult);
    });
  });
}

function chaptersAndTopicsFromTest(test_id) {
  return new Promise((resolve, reject) => {
    getchaptersAndTopicsFromTest(test_id, (err, subjectResult) => {
      if (err) {
        reject('Error in test result')
      }
      resolve(subjectResult);
    });
  });
}

function getResultByTestAndUser(user_id, test_id) {
  return new Promise((resolve, reject) => {
    getResultOfTest(user_id, test_id, async (err, results) => {
      if (err) {
        reject('Error in test result')
      }

      const marks = results.reduce((prev, next) => prev + next.marks, 0);
      const marksObtained = results.reduce(
        (prev, next) => prev + next.markes_obtained,
        0
      );

      const { subject, test } = await subjectFromTest(test_id);

      const chaptersAndTopics = await chaptersAndTopicsFromTest(test_id);
      resolve({
        subject,
        chaptersAndTopics,
        test,
        result: {
          totalMarkes: marks,
          marksObtained,
          percentage: (marksObtained / marks) * 100,
          questions: results
        }
      });
    });
  });
}

function insertResult(data, user_id, test_id) {
  return new Promise((resolve, reject) => {
    insertTestResult(data, user_id, test_id, (err, results) => {
      if (err) {
        reject("Error in insert result, please try again later");
      }
      resolve("done");
    });
  });
}

function deleteResult(user_id, test_id) {
  return new Promise((resolve, reject) => {
    deleteTestResultIfExist(user_id, test_id, (err, results) => {
      if (err) {
        reject("Error in insert result, please try again later");
      }
      resolve("done");
    });
  });
}

module.exports = {
  getTestInfo: async (req, res) => {
    const { test_id } = req.query;

    try {
      var test = await getTest(test_id);
    } catch (e) {
      return res.json({
        success: 0,
        message: e
      });
    }

    try {
      var questions = await getTestQuestions(test_id);
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
        test,
        questions
      }
    });
  },
  submitTest: async (req, res) => {
    const { id: user_id } = req.decoded.result;

    // Get calulated result
    try {
      var result = await getResult(req.body, user_id);
    } catch (e) {
      return res.json({
        success: 0,
        message: e
      });
    }

    // Delete  result
    try {
      await deleteResult(user_id, req.body.test_id);
    } catch (e) {
      return res.json({
        success: 0,
        message: e
      });
    }

    // Insert result
    try {
      await insertResult(result, user_id, req.body.test_id);
    } catch (e) {
      return res.json({
        success: 0,
        message: e
      });
    }

    // get result of test
    getResultOfTest(user_id, req.body.test_id, (err, results) => {
      if (err) {
        return res.json({
          success: 0,
          message: err
        });
      }

      const marks = results.reduce((prev, next) => prev + next.marks, 0);
      const marksObtained = results.reduce(
        (prev, next) => prev + next.markes_obtained,
        0
      );

      return res.json({
        success: 1,
        message: "Your request went through successfully",
        data: {
          totalMarkes: marks,
          marksObtained,
          percentage: (marksObtained / marks) * 100,
          questions: results
        }
      });
    });
  },
  getTestResult: async (req, res) => {
    const { id: user_id } = req.decoded.result;

    const errHandler = err => {
      return res.json({
        success: 0,
        message: err
      });
    };

    // var result = await getSubscribedSubject(user_id);
    var tests = await getSubmitedTests(user_id).catch(errHandler);
    if (tests.length == 0) {
      return res.json({
        success: 0,
        message: "No results found"
      });
    }

    const results = tests.map(test => {
      return getResultByTestAndUser(user_id, test.test_id)
    });

    const outputResult = await Promise.all(results);

    return res.json({
      success: 1,
      message: "Your request went through successfully",
      data: outputResult
    });
  }
};
