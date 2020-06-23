const { validationResult } = require("express-validator");

const { getStudents, changeStatus: changeUserStatus, getUserByUserIdForAdmin, getUserByUserEmail, getSubscribedSubjectsOfUser } = require("../user/user.model");

const { getStandardsAdmin, changeStatus: changeStandardStatus, createStandardAdmin, editStandardAdmin, deleteStandardAdmin, getStandardFromId } = require("../standard/standard.model");

const { getSubjectsAdmin, changeStatus: changeSubjectStatus, createSubjectAdmin, getSubjectFromIdAdmin, deleteSubjectAdmin, editSubjectAdmin, getSubjectsForChapter } = require("../subject/subject.model");

const { getChaptersAdmin, changeStatus: changeChapterStatus, createChapterAdmin, getChapterFromIdAdmin, editChapterAdmin, deleteChapterAdmin, getChaptersForTopic, getChaptersFromSubjectId } = require('../chapter/chapter.model');

const { getTopicsAdmin, changeStatus: changeTopicStatus, createTopicAdmin, getTopicFromIdAdmin, editTopicAdmin, deleteTopicAdmin } = require('../topic/topic.model');

const { getFaqsAdmin, changeStatus: changeFaqStatus, createFaqAdmin, getFaqFromIdAdmin, editFaqAdmin, deleteFaqAdmin } = require('../faq/faq.model');

const { getReviewsAdmin, listSchoolResultsAdmin, getTeachersAdmin, createTeacherAdmin, getTeacherFromIdAdmin, editTeacherAdmin, deleteTeacherAdmin, getDemoVideoFromIdAdmin, editDemoVideoAdmin, getSubscribedUsersAdmin, getUnSubscribedUsersAdmin, getSubscriptionValueAdmin, getUniqueCitiesAdmin, getTeachersCountAdmin } = require('../common/common.model');

const { getTestsAdmin, changeStatus: changeTestStatus, createTestAdmin, insertTestChaptersAdmin, insertTestQuestionAdmin, insertTestQuestionOptionsAdmin, getTestsFromId, getQuestionsFromTestIdAdmin, getChaptersFromTestId, deleteTestAdmin, editTestAdmin, deleteChaptersFromTestAdmin, deleteQuestionsFromTestAdmin } = require('../test/test.model');

const { compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");

function createTest({ subject_id, type, name, marks }) {
  return new Promise((resolve, reject) => {
    createTestAdmin({ subject_id, type, name, marks }, (err, results) => {
      if (err) {
        reject("Error in create test");
      }

      resolve(results);
    });
  });
}

function updateTest({ id, subject_id, type, name, marks }) {
  return new Promise((resolve, reject) => {
    editTestAdmin({ id, subject_id, type, name, marks }, (err, results) => {
      if (err) {
        reject("Error in create test");
      }

      resolve("Done");
    });
  });
}

function insertTestChapters(data) {
  return new Promise((resolve, reject) => {
    insertTestChaptersAdmin(data, (err, results) => {
      if (err) {
        reject("Errors in insert chapters");
      }
      resolve("done");
    });
  });
}

function deleteTestChapters(id) {
  return new Promise((resolve, reject) => {
    deleteChaptersFromTestAdmin(id, (err, results) => {
      if (err) {
        reject("Errors in insert chapters");
      }
      resolve("done");
    });
  });
}

function deleteTestQuestions(id) {
  return new Promise((resolve, reject) => {
    deleteQuestionsFromTestAdmin(id, (err, results) => {
      if (err) {
        reject("Errors in insert chapters");
      }
      resolve("done");
    });
  });
}

function insertTestQuestion(testId, { question, answer, type, marks }) {
  return new Promise((resolve, reject) => {
    insertTestQuestionAdmin(testId, question, answer, type, marks, (err, results) => {
      if (err) {
        reject("Errors in insert question");
      }
      resolve(results);
    });
  });
}

function getTestFromId(id) {
  return new Promise((resolve, reject) => {
    getTestsFromId(id, (err, results) => {
      if (err) {
        reject("Errors in insert question");
      }
      resolve(results);
    });
  });
}

function insertTestQuestionOptions(data) {
  return new Promise((resolve, reject) => {
    insertTestQuestionOptionsAdmin(data, (err, results) => {
      if (err) {
        reject("Errors in insert chapters");
      }
      resolve("done");
    });
  });
}

function getQuestionsFromTest(id) {
  return new Promise((resolve, reject) => {
    getQuestionsFromTestIdAdmin(id, (err, results) => {
      if (err) {
        reject("Errors in insert question");
      }
      resolve(results);
    });
  });
}

function getChaptersFromTest(id) {
  return new Promise((resolve, reject) => {
    getChaptersFromTestId(id, (err, results) => {
      if (err) {
        reject("Errors in insert question");
      }
      resolve(results);
    });
  });
}

function getSubscribedUsers() {
  return new Promise((resolve, reject) => {
    getSubscribedUsersAdmin((err, results) => {
      if (err) {
        reject("Errors in subscribed users");
      }
      resolve(results);
    });
  });
}

function getUnSubscribedUsers() {
  return new Promise((resolve, reject) => {
    getUnSubscribedUsersAdmin((err, results) => {
      if (err) {
        reject("Errors in UnSubscribed users");
      }
      resolve(results);
    });
  });
}

function getSubscriptionValue() {
  return new Promise((resolve, reject) => {
    getSubscriptionValueAdmin((err, results) => {
      if (err) {
        reject("Errors in Subscription value");
      }
      resolve(results);
    });
  });
}

function getUniqueCities() {
  return new Promise((resolve, reject) => {
    getUniqueCitiesAdmin((err, results) => {
      if (err) {
        reject("Errors in Cities");
      }
      resolve(results);
    });
  });
}

function getTeachersCount() {
  return new Promise((resolve, reject) => {
    getTeachersCountAdmin((err, results) => {
      if (err) {
        reject("Errors in Teachers");
      }
      resolve(results);
    });
  });
}

module.exports = {
  login: (req, res) => {
    const body = req.body;
    getUserByUserEmail(body.email, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Database issue please try again later"
        });
      }
      if (!results) {
        return res.status(403).json({
          success: 0,
          message: "Invalid email or password"
        });
      }

      const result = compareSync(body.password, results.password);
      if (result) {
        if (results.role_id !== 1) {
          return res.status(403).json({
            success: 0,
            message: "Make sure you are login with admin user"
          });
        }

        results.password = undefined;
        results.device_token = body.device_token;
        const jsontoken = sign({ result: results }, process.env.JWT_KEY, {
          expiresIn: "7 days"
        });
        return res.json({
          success: 1,
          message: "login successfully",
          token: jsontoken,
          data: results
        });
      } else {
        return res.status(403).json({
          success: 0,
          message: "Invalid email or password"
        });
      }
    });
  },
  getDashboard: async (req, res) => {
    const errHandler = err => {
      return res.json({
        success: 0,
        message: err
      });
    };

    const { subscribed_users } = await getSubscribedUsers().catch(errHandler);

    const { unSubscribed_users } = await getUnSubscribedUsers().catch(errHandler);

    const { teachers_count } = await getTeachersCount().catch(errHandler);

    const subscription_values = await getSubscriptionValue().catch(errHandler);

    const cities = await getUniqueCities().catch(errHandler);

    return res.json({
      success: 1,
      message: "User fetch successfully",
      data: {
        subscribed_users,
        unSubscribed_users,
        teachers_count,
        subscription_values,
        cities
      }
    });


  },
  getUsers: (req, res) => {
    getStudents((err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "User fetch successfully",
        data: results
      });
    });
  },
  userChangeStatus: (req, res) => {
    const { user_id } = req.body;

    changeUserStatus(user_id, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }

      return res.json({
        success: 1,
        message: "Status changed successfully"
      });
    });
  },
  getUser: (req, res) => {
    const { user_id } = req.query;

    getUserByUserIdForAdmin(user_id, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      if (!results) {
        return res.json({
          success: 0,
          message: "User not found",
        });
      }
      getSubscribedSubjectsOfUser(user_id, (err, subjects) => {
        if (err) {
          return res.status(500).json({
            success: 0,
            message: "Problem in database",
          });
        }
        results.subscribed_subjects = Array.prototype.map.call(subjects, s => s.subject).toString();
        return res.json({
          success: 1,
          message: "User get successfully",
          data: results
        });
      });
    });
  },
  getStandards: (req, res) => {
    getStandardsAdmin((err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Standards fetch successfully",
        data: results
      });
    });
  },
  standardChangeStatus: (req, res) => {
    const { standard_id } = req.body;

    changeStandardStatus(standard_id, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }

      return res.json({
        success: 1,
        message: "Status changed successfully"
      });
    });
  },
  postStandard: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: 0, errors: errors.array() });
    }

    const { standard } = req.body;

    createStandardAdmin(standard, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Standard created successfully",
      });
    });
  },
  editStandard: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: 0, errors: errors.array() });
    }

    const { standard, id: standard_id } = req.body;

    editStandardAdmin({ standard_id, standard }, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Standard Updated successfully",
      });
    });
  },
  deleteStandard: (req, res) => {
    const { id: standard_id } = req.body;

    deleteStandardAdmin(standard_id, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Standard Deleted successfully",
      });
    });
  },
  getStandard: (req, res) => {
    const { id } = req.query;
    getStandardFromId(id, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Standard Found sucessfully",
        data: results
      });
    });
  },
  getSubjects: (req, res) => {
    getSubjectsAdmin((err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Subjects fetch successfully",
        data: results
      });
    });
  },
  subjectChangeStatus: (req, res) => {
    const { subject_id } = req.body;

    changeSubjectStatus(subject_id, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }

      return res.json({
        success: 1,
        message: "Status changed successfully"
      });
    });
  },
  postSubject: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: 0, errors: errors.array() });
    }

    const { standard_id, subject, price } = req.body;

    createSubjectAdmin({ standard_id, subject, price }, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Subject created successfully",
      });
    });
  },
  getSubject: (req, res) => {
    const { id } = req.query;
    getSubjectFromIdAdmin(id, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Subject Found sucessfully",
        data: results
      });
    });
  },
  editSubject: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: 0, errors: errors.array() });
    }

    const { standard_id, subject, price, id } = req.body;

    editSubjectAdmin({ standard_id, subject, price, id }, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Subject Updated successfully",
      });
    });
  },
  deleteSubject: (req, res) => {
    const { id: subject_id } = req.body;

    deleteSubjectAdmin(subject_id, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Subject Deleted successfully",
      });
    });
  },
  getChapters: (req, res) => {
    getChaptersAdmin((err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Chapters fetch successfully",
        data: results
      });
    });
  },
  chaptersChangeStatus: (req, res) => {
    const { chapter_id } = req.body;

    changeChapterStatus(chapter_id, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }

      return res.json({
        success: 1,
        message: "Status changed successfully"
      });
    });
  },
  subjectsForChapter: (req, res) => {
    getSubjectsForChapter((err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Subjects fetch successfully",
        data: results
      });
    });
  },
  postChapter: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: 0, errors: errors.array() });
    }
    const { subject_id, chapter_no, chapter_name } = req.body;
    createChapterAdmin({ subject_id, chapter_no, chapter_name }, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Chapter created successfully",
      });
    });
  },
  getChapter: (req, res) => {
    const { id } = req.query;
    getChapterFromIdAdmin(id, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Chapter Found sucessfully",
        data: results
      });
    });
  },
  editChapter: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: 0, errors: errors.array() });
    }

    const { subject_id, chapter_no, chapter_name, id } = req.body;

    editChapterAdmin({ subject_id, chapter_no, chapter_name, id }, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Subject Updated successfully",
      });
    });
  },
  deleteChapter: (req, res) => {
    const { id: chapter_id } = req.body;

    deleteChapterAdmin(chapter_id, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Chapter Deleted successfully",
      });
    });
  },
  getTopics: (req, res) => {
    getTopicsAdmin((err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Topics fetch successfully",
        data: results
      });
    });
  },
  topicsChangeStatus: (req, res) => {
    const { topic_id } = req.body;
    changeTopicStatus(topic_id, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }

      return res.json({
        success: 1,
        message: "Status changed successfully"
      });
    });
  },
  chaptersForTopic: (req, res) => {
    getChaptersForTopic((err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Chapters fetch successfully",
        data: results
      });
    });
  },
  postTopic: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: 0, errors: errors.array() });
    }
    const { chapter_id, topic_no, topic_name, video_url, meta_text, meta_description, is_free } = req.body;

    createTopicAdmin({ chapter_id, topic_no, topic_name, video_url, meta_text, meta_description, is_free }, (err, results) => {

      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Topic created successfully",
      });
    });
  },
  getTopic: (req, res) => {
    const { id } = req.query;
    getTopicFromIdAdmin(id, (err, results) => {

      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Topic Found sucessfully",
        data: results
      });
    });
  },
  editTopic: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: 0, errors: errors.array() });
    }

    const { chapter_id, topic_no, topic_name, video_url, meta_text, meta_description, is_free, id } = req.body;

    editTopicAdmin({ chapter_id, topic_no, topic_name, video_url, meta_text, meta_description, is_free, id }, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Topic Updated successfully",
      });
    });
  },
  deleteTopic: (req, res) => {
    const { id: topic_id } = req.body;

    deleteTopicAdmin(topic_id, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Topic Deleted successfully",
      });
    });
  },
  getFaqs: (req, res) => {
    getFaqsAdmin((err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Faqs fetch successfully",
        data: results
      });
    });
  },
  faqChangeStatus: (req, res) => {
    const { faq_id } = req.body;
    changeFaqStatus(faq_id, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }

      return res.json({
        success: 1,
        message: "Status changed successfully"
      });
    });
  },
  chaptersForFaq: (req, res) => {
    getChaptersForTopic((err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Chapters fetch successfully",
        data: results
      });
    });
  },
  postFaq: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: 0, errors: errors.array() });
    }
    const { chapter_id, type, question, answer } = req.body;

    createFaqAdmin({ chapter_id, type, question, answer }, (err, results) => {

      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Faq created successfully",
      });
    });
  },
  getFaq: (req, res) => {
    const { id } = req.query;
    getFaqFromIdAdmin(id, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Faq Found sucessfully",
        data: results
      });
    });
  },
  editFaq: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: 0, errors: errors.array() });
    }

    const { chapter_id, type, question, answer, id } = req.body;

    editFaqAdmin({ chapter_id, type, question, answer, id }, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Faq Updated successfully",
      });
    });
  },
  deleteFaq: (req, res) => {
    const { id: faq_id } = req.body;
    deleteFaqAdmin(faq_id, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Faq Deleted successfully",
      });
    });
  },
  getReviews: (req, res) => {
    getReviewsAdmin((err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Reviews fetch successfully",
        data: results
      });
    });
  },
  getSchoolResults: (req, res) => {
    listSchoolResultsAdmin((err, results) => {
      if (err) {
        return res.json({
          success: 0,
          message: "Database issue please try again later"
        });
      }
      return res.json({
        success: 1,
        message: "You get school result successfully",
        data: results
      });
    });
  },

  getTeachers: (req, res) => {
    getTeachersAdmin((err, results) => {
      if (err) {
        return res.json({
          success: 0,
          message: "Database issue please try again later"
        });
      }
      return res.json({
        success: 1,
        message: "Teachers fetch successfully",
        data: results
      });
    });
  },
  postTeacher: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: 0, errors: errors.array() });
    }
    const { name, promocode, age, gender, qualification, post, address, phone } = req.body;

    createTeacherAdmin({ name, promocode, age, gender, qualification, post, address, phone }, (err, results) => {

      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Teacher created successfully",
      });
    });
  },
  getTeacher: (req, res) => {
    const { id } = req.query;
    getTeacherFromIdAdmin(id, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Teacher Found sucessfully",
        data: results
      });
    });
  },
  editTeacher: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: 0, errors: errors.array() });
    }

    const { name, promocode, age, gender, qualification, post, phone, address, id } = req.body;

    editTeacherAdmin({ name, promocode, age, gender, qualification, post, phone, address, id }, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Teacher Updated successfully",
      });
    });
  },
  deleteTeacher: (req, res) => {
    const { id: teacher_id } = req.body;
    deleteTeacherAdmin(teacher_id, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Teacher Deleted successfully",
      });
    });
  },
  getDemoVideo: (req, res) => {
    const { id } = req.query;
    getDemoVideoFromIdAdmin(id, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Demo video Found sucessfully",
        data: results
      });
    });
  },
  editDemoVideo: (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: 0, errors: errors.array() });
    }

    const { video_url, id } = req.body;

    editDemoVideoAdmin({ video_url, id }, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Demo video Updated successfully",
      });
    });
  },
  getTests: (req, res) => {
    getTestsAdmin((err, results) => {
      if (err) {
        return res.json({
          success: 0,
          message: "Database issue please try again later"
        });
      }
      return res.json({
        success: 1,
        message: "Tests fetch successfully",
        data: results
      });
    });
  },
  testChangeStatus: (req, res) => {
    const { test_id } = req.body;
    changeTestStatus(test_id, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }

      return res.json({
        success: 1,
        message: "Status changed successfully"
      });
    });
  },
  deleteTest: (req, res) => {
    const { id: test_id } = req.body;
    deleteTestAdmin(test_id, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Test Deleted successfully",
      });
    });
  },
  postTest: async (req, res) => {
    const errHandler = err => {
      return res.json({
        success: 0,
        message: err
      });
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: 0, errors: errors.array() });
    }
    const { insertId: testID } = await createTest(req.body).catch(errHandler);

    const { chapters, questions } = req.body;
    //Chapters
    if (typeof chapters != 'undefined') {
      var testChapters = chapters.map(function (chapter) {
        return [testID, chapter]
      });
      await insertTestChapters(testChapters).catch(errHandler);
    }

    // Questions
    if (typeof questions != 'undefined') {
      for (const question of questions) {
        const { insertId: questionID } = await insertTestQuestion(testID, question).catch(errHandler);
        const { options } = question;
        if (typeof options != 'undefined') {
          var testQuestionOptions = options.map(function (option) {
            return [questionID, option]
          });
          await insertTestQuestionOptions(testQuestionOptions).catch(errHandler);
        }
      }
    }

    return res.json({
      success: 1,
      message: "Test created successfully"
    });

  },
  getChaptersFromSubject: (req, res) => {
    const { subject_id } = req.query;
    getChaptersFromSubjectId(subject_id, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: 0,
          message: "Problem in database",
        });
      }
      return res.json({
        success: 1,
        message: "Chapters Found sucessfully",
        data: results
      });
    });
  },
  getTest: async (req, res) => {
    const { id } = req.query;
    const errHandler = err => {
      return res.json({
        success: 0,
        message: err
      });
    };

    const test = await getTestFromId(id).catch(errHandler);
    const questions = await getQuestionsFromTest(test.id).catch(errHandler);

    var chapters = await getChaptersFromTest(test.id).catch(errHandler);

    chapters = chapters.map(chapter => chapter.chapter_id);
    return res.json({
      success: 1,
      message: "Test Found sucessfully",
      data: {
        ...test,
        questions,
        chapters
      }
    });
  },
  editTest: async (req, res) => {
    const errHandler = err => {
      return res.json({
        success: 0,
        message: err
      });
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: 0, errors: errors.array() });
    }
    await updateTest(req.body).catch(errHandler);

    const { chapters, questions, id } = req.body;

    //Chapters

    //Delete Chapter if exist
    var response = await deleteTestChapters(id).catch(errHandler);

    if (typeof chapters != 'undefined') {
      var testChapters = chapters.map(function (chapter) {
        return [id, chapter]
      });
      await insertTestChapters(testChapters).catch(errHandler);
    }

    // Questions
    // Delete Questions if exist
    await deleteTestQuestions(id).catch(errHandler);

    if (typeof questions != 'undefined') {
      for (const question of questions) {
        const { insertId: questionID } = await insertTestQuestion(id, question).catch(errHandler);
        const { options } = question;
        if (typeof options != 'undefined') {
          var testQuestionOptions = options.map(function (option) {
            return [questionID, option]
          });
          await insertTestQuestionOptions(testQuestionOptions).catch(errHandler);
        }
      }
    }

    return res.json({
      success: 1,
      message: "Test updated successfully"
    });

  }
};
