const router = require("express").Router();
const { check } = require("express-validator");
const { checkAdminToken } = require("../../auth/token_validation");
const {
  login, getDashboard,
  getUsers, userChangeStatus, getUser,
  getStandards, standardChangeStatus, postStandard, editStandard, deleteStandard, getStandard,
  getSubjects, subjectChangeStatus, postSubject, getSubject, editSubject, deleteSubject,
  getChapters, chaptersChangeStatus, subjectsForChapter, postChapter, getChapter, editChapter, deleteChapter,
  getTopics, topicsChangeStatus, chaptersForTopic, postTopic, getTopic, editTopic, deleteTopic,
  getFaqs, faqChangeStatus, chaptersForFaq, postFaq, getFaq, editFaq, deleteFaq, getReviews, getSchoolResults,
  getTeachers, postTeacher, getTeacher, editTeacher, deleteTeacher, getDemoVideo, editDemoVideo,
  getTests, testChangeStatus, postTest, deleteTest, getChaptersFromSubject, getTest, editTest

} = require("./admin.controller");

const { getPromocodeByName } = require("../common/common.model");

// Login
router.post("/login", login);
router.get("/dashboard", checkAdminToken, getDashboard);
// Users
router.get("/users", checkAdminToken, getUsers);
router.post("/user/change_status", checkAdminToken, userChangeStatus);
router.get("/user", checkAdminToken, getUser);
// Standards
router.get("/standards", checkAdminToken, getStandards);
router.post("/standard/change_status", checkAdminToken, standardChangeStatus);
router.post("/standard/create",
  [
    checkAdminToken,
    check("standard")
      .not()
      .isEmpty()
      .withMessage("Standard is required"),
  ],
  postStandard);
router.get("/standard", checkAdminToken, getStandard);
router.post("/standard/edit",
  [
    checkAdminToken,
    check("standard")
      .not()
      .isEmpty()
      .withMessage("Standard is required"),
  ],
  editStandard);
router.post("/standard/delete", checkAdminToken, deleteStandard);
// Subjects
router.get("/subjects", checkAdminToken, getSubjects);
router.post("/subject/change_status", checkAdminToken, subjectChangeStatus);
router.post("/subject/create",
  [
    checkAdminToken,
    check("standard_id")
      .not()
      .isEmpty()
      .withMessage("Standard is required"),
    check("subject")
      .not()
      .isEmpty()
      .withMessage("Subject is required"),
    check("price")
      .not()
      .isEmpty()
      .withMessage("Price is required"),
  ],
  postSubject);
router.get("/subject", checkAdminToken, getSubject);
router.post("/subject/edit",
  [
    checkAdminToken,
    check("standard_id")
      .not()
      .isEmpty()
      .withMessage("Standard is required"),
    check("subject")
      .not()
      .isEmpty()
      .withMessage("Subject is required"),
    check("price")
      .not()
      .isEmpty()
      .withMessage("Price is required"),
  ],
  editSubject);
router.post("/subject/delete", checkAdminToken, deleteSubject);

// Chapters
router.get("/chapters", checkAdminToken, getChapters);
router.post("/chapter/change_status", checkAdminToken, chaptersChangeStatus);
router.get("/chapters/get_subjects", checkAdminToken, subjectsForChapter);
router.post("/chapter/create",
  [
    checkAdminToken,
    check("subject_id")
      .not()
      .isEmpty()
      .withMessage("Subject is required"),
    check("chapter_no")
      .not()
      .isEmpty()
      .withMessage("Chapter number is required"),
    check("chapter_name")
      .not()
      .isEmpty()
      .withMessage("Chapter name is required"),
  ],
  postChapter);
router.get("/chapter", checkAdminToken, getChapter);
router.post("/chapter/edit",
  [
    checkAdminToken,
    check("subject_id")
      .not()
      .isEmpty()
      .withMessage("Subject is required"),
    check("chapter_no")
      .not()
      .isEmpty()
      .withMessage("Chapter number is required"),
    check("chapter_name")
      .not()
      .isEmpty()
      .withMessage("Chapter name is required"),
  ],
  editChapter);
router.post("/chapter/delete", checkAdminToken, deleteChapter);

// Topics
router.get("/topics", checkAdminToken, getTopics);
router.post("/topic/change_status", checkAdminToken, topicsChangeStatus);
router.get("/topics/get_chapters", checkAdminToken, chaptersForTopic);
router.post("/topic/create",
  [
    checkAdminToken,
    check("chapter_id")
      .not()
      .isEmpty()
      .withMessage("Chapter is required"),
    check("topic_no")
      .not()
      .isEmpty()
      .withMessage("Topic number is required"),
    check("topic_name")
      .not()
      .isEmpty()
      .withMessage("Topic name is required"),
    check("video_url")
      .not()
      .isEmpty()
      .withMessage("Video is required")
  ],
  postTopic);
router.get("/topic", checkAdminToken, getTopic);
router.post("/topic/edit",
  [
    checkAdminToken,
    check("chapter_id")
      .not()
      .isEmpty()
      .withMessage("Chapter is required"),
    check("topic_no")
      .not()
      .isEmpty()
      .withMessage("Topic number is required"),
    check("topic_name")
      .not()
      .isEmpty()
      .withMessage("Topic name is required"),
    check("video_url")
      .not()
      .isEmpty()
      .withMessage("Video is required")
  ],
  editTopic);
router.post("/topic/delete", checkAdminToken, deleteTopic);

// FAQ
router.get("/faqs", checkAdminToken, getFaqs);
router.post("/faq/change_status", checkAdminToken, faqChangeStatus);
router.get("/faqs/get_chapters", checkAdminToken, chaptersForFaq);
router.post("/faq/create",
  [
    checkAdminToken,
    check("chapter_id")
      .not()
      .isEmpty()
      .withMessage("Chapter is required"),
    check("type")
      .not()
      .isEmpty()
      .withMessage("Type is required"),
    check("question")
      .not()
      .isEmpty()
      .withMessage("Question is required"),
    check("answer")
      .not()
      .isEmpty()
      .withMessage("Answer is required")
  ],
  postFaq);
router.get("/faq", checkAdminToken, getFaq);
router.post("/faq/edit",
  [
    checkAdminToken,
    check("chapter_id")
      .not()
      .isEmpty()
      .withMessage("Chapter is required"),
    check("type")
      .not()
      .isEmpty()
      .withMessage("Type is required"),
    check("question")
      .not()
      .isEmpty()
      .withMessage("Question is required"),
    check("answer")
      .not()
      .isEmpty()
      .withMessage("Answer is required")
  ],
  editFaq);
router.post("/faq/delete", checkAdminToken, deleteFaq);

// Reviews
router.get("/reviews", checkAdminToken, getReviews);

// School results
router.get("/school_results", checkAdminToken, getSchoolResults);

// Teacher
router.get("/teachers", checkAdminToken, getTeachers);
router.post("/teacher/create",
  [
    checkAdminToken,
    check("name")
      .not()
      .isEmpty()
      .withMessage("Name is required"),
    check("age")
      .not()
      .isEmpty()
      .withMessage("Age is required"),
    check("gender")
      .not()
      .isEmpty()
      .withMessage("Gender is required"),
    check("qualification")
      .not()
      .isEmpty()
      .withMessage("Qualification is required"),
    check("post")
      .not()
      .isEmpty()
      .withMessage("Post is required"),
    check("phone")
      .not()
      .isEmpty()
      .withMessage("Phone is required"),
    check("promocode")
      .not()
      .isEmpty()
      .withMessage("Promocode is required")
      .custom((value, { req }) => {
        return new Promise((resolve, reject) => {
          getPromocodeByName(req.body.promocode, (err, results) => {
            if (err) {
              reject(new Error("Server Error"));
            }
            if (results.length > 0) {
              reject(new Error("Promocode already in use"));
            }
            resolve(true);
          });
        });
      }),
  ],
  postTeacher);
router.get("/teacher", checkAdminToken, getTeacher);
router.post("/teacher/edit",
  [
    checkAdminToken,
    check("name")
      .not()
      .isEmpty()
      .withMessage("Name is required"),
    check("age")
      .not()
      .isEmpty()
      .withMessage("Age is required"),
    check("gender")
      .not()
      .isEmpty()
      .withMessage("Gender is required"),
    check("qualification")
      .not()
      .isEmpty()
      .withMessage("Qualification is required"),
    check("post")
      .not()
      .isEmpty()
      .withMessage("Post is required"),
    check("phone")
      .not()
      .isEmpty()
      .withMessage("Phone is required"),
    check("promocode")
      .not()
      .isEmpty()
      .withMessage("Promocode is required")
  ],
  editTeacher);
router.post("/teacher/delete", checkAdminToken, deleteTeacher);

// Demo video
router.get("/demo_video", checkAdminToken, getDemoVideo);
router.post("/demo_video/edit",
  [
    checkAdminToken,
    check("video_url")
      .not()
      .isEmpty()
      .withMessage("Video URL is required")
  ],
  editDemoVideo);

// Tests
router.get("/tests", checkAdminToken, getTests);
router.post("/test/change_status", checkAdminToken, testChangeStatus);
router.get("/test/get_chapters_from_subject", checkAdminToken, getChaptersFromSubject);
router.post("/test/create",
  [
    checkAdminToken,
    check("subject_id")
      .not()
      .isEmpty()
      .withMessage("Subject is required"),
    check("type")
      .not()
      .isEmpty()
      .withMessage("Type is required"),
    check("name")
      .not()
      .isEmpty()
      .withMessage("Test name is required"),
    check("marks")
      .not()
      .isEmpty()
      .withMessage("Marks is required")
  ],
  postTest);
router.get("/test", checkAdminToken, getTest);
router.post("/test/edit",
  [
    checkAdminToken,
    check("subject_id")
      .not()
      .isEmpty()
      .withMessage("Subject is required"),
    check("type")
      .not()
      .isEmpty()
      .withMessage("Type is required"),
    check("name")
      .not()
      .isEmpty()
      .withMessage("Test name is required"),
    check("marks")
      .not()
      .isEmpty()
      .withMessage("Marks is required")
  ],
  editTest);
router.post("/test/delete", checkAdminToken, deleteTest);

module.exports = router;
