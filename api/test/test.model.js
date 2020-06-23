const pool = require("../../config/database");
const table = "tests";
const questionTable = "test_questions";
const resultTable = "test_results";
const _ = require("lodash");

module.exports = {
  getPracticeTestsFromChapter: (chapter_id, callBack) => {
    pool.query(
      `select t.id as id, t.name as name, t.type as type, t.marks as marks from ${table} as t JOIN tests_chapters as tc ON t.id=tc.test_id where t.is_active=1 and t.type="practice" and tc.chapter_id=?`,
      [chapter_id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getMockTestsFromSubject: (subject_id, callBack) => {
    pool.query(
      `select id, name, type, marks from ${table} where is_active=1 and type="mock" and subject_id=? and is_active=1`,
      [subject_id],
      (error, results) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getTestsFromId: (test_id, callBack) => {
    pool.query(
      `select id,subject_id, name, type, marks from ${table} where id=?`,
      [test_id],
      (error, results) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  getQuestionsFromTestId: (test_id, callBack) => {
    pool.query(
      `select q.id as id, q.question as question, q.type as type, q.marks as marks, qo.name as options from ${questionTable} as q LEFT JOIN test_question_options as qo ON q.id = qo.question_id where q.test_id=?`,
      [test_id],
      (error, results) => {
        if (error) {
          callBack(error);
        }
        var finalResults = _.chain(results)
          .groupBy("id")
          .map(function (v, i) {
            return {
              id: i,
              question: _.get(_.find(v, "question"), "question"),
              type: _.get(_.find(v, "type"), "type"),
              marks: _.get(_.find(v, "marks"), "marks"),
              options: _.reduce(
                v,
                function (acc, obj) {
                  var { options } = obj;
                  if (!_.isNull(options)) {
                    acc.push(options);
                  }
                  return acc;
                },
                []
              )
            };
          })
          .value();
        return callBack(null, finalResults);
      }
    );
  },
  getQuestionsFromTestIdForResult: (test_id, callBack) => {
    pool.query(
      `select id as question_id, answer, marks from ${questionTable} where test_id=?`,
      [test_id],
      (error, results) => {
        if (error) {
          callBack(error);
        }

        return callBack(null, results);
      }
    );
  },
  insertTestResult: (data, user_id, test_id, callBack) => {
    // Delete results if exist
    // pool.query(`delete from ${resultTable} where user_id = ? AND test_id=?`, [
    //   user_id,
    //   test_id
    // ]);

    pool.query(
      `insert into ${resultTable} (user_id, test_id, question_id, answer, is_correct, markes_obtained) 
                values ?`,
      [data],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  deleteTestResultIfExist: (user_id, test_id, callBack) => {
    // Delete results if exist
    pool.query(
      `delete from ${resultTable} where user_id = ? AND test_id=?`,
      [user_id, test_id],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getResultOfTest: (user_id, test_id, callBack) => {
    pool.query(
      `select q.id as id, q.question as question, q.answer as original_answer, q.marks as marks, qr.answer as your_answer, qr.is_correct as is_correct, qr.markes_obtained as markes_obtained	from ${questionTable} as q JOIN ${resultTable} as qr ON q.id = qr.question_id where qr.test_id=? AND qr.user_id =?`,
      [test_id, user_id],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getSubmitedTestsByUser: (user_id, callBack) => {
    pool.query(`select distinct(test_id) from ${resultTable} where user_id = ? `, [user_id], (error, results, fields) => {
      if (error) {
        return callBack(error);
      }
      return callBack(null, results);
    });
  },
  getSubjectFromTest: (test_id, callBack) => {
    pool.query(`select sub.name as subject, t.name as test from ${table} as t JOIN subjects as sub ON t.subject_id = sub.id where t.id = ? `, [test_id], (error, results, fields) => {
      if (error) {
        return callBack(error);
      }
      return callBack(null, results[0]);
    });
  },
  getchaptersAndTopicsFromTest: (test_id, callBack) => {
    pool.query(`select c.id as chapter_id, c.chapter_name as chapter, tp.topic_name as topic from tests_chapters as tc JOIN chapters as c ON tc.chapter_id = c.id JOIN topics as tp ON tp.chapter_id = c.id where tc.test_id = ? `, [test_id], (error, results, fields) => {
      if (error) {
        return callBack(error);
      }

      var finalResults = _.chain(results)
        .groupBy("chapter_id")
        .map(function (v, i) {
          return {
            chapter: _.get(_.find(v, "chapter"), "chapter"),
            topic: _.reduce(
              v,
              function (acc, obj) {
                var { topic } = obj;
                if (!_.isNull(topic)) {
                  acc.push(topic);
                }
                return acc;
              },
              []
            )
          };
        })
        .value();


      return callBack(null, finalResults);
    });
  },
  getTestsAdmin: callBack => {
    pool.query(
      `select t.id as id, std.name as standard, sub.name as subject, GROUP_CONCAT(c.chapter_name) as chapters, t.name as name, t.type as type, t.marks as marks, t.is_active as is_active from ${table} t JOIN subjects sub ON t.subject_id = sub.id JOIN standards std ON sub.standard_id = std.id LEFT JOIN tests_chapters tc ON t.id = tc.test_id LEFT JOIN chapters c ON tc.chapter_id = c.id GROUP BY t.id`,
      [],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  changeStatus: (id, callBack) => {
    pool.query(
      `update ${table} SET is_active = !is_active where id = ?`,
      [id],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  createTestAdmin: ({ subject_id, type, name, marks }, callBack) => {
    pool.query(
      `insert into ${table} (subject_id, type, name, marks) values(?,?,?,?)`,
      [
        subject_id,
        type,
        name,
        marks,
      ],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  deleteTestAdmin: (id, callBack) => {
    pool.query(
      `delete from ${table} where id = ?`,
      [
        id
      ],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  insertTestChaptersAdmin: (data, callBack) => {
    pool.query(
      `insert into tests_chapters (test_id, chapter_id) 
                values ?`,
      [data],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  insertTestQuestionAdmin: (testId, question, answer, type, marks, callBack) => {
    pool.query(
      `insert into ${questionTable} (test_id,question, answer, type, marks) 
      values(?,?,?,?,?)`,
      [testId, question, answer, type, marks],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  insertTestQuestionOptionsAdmin: (data, callBack) => {
    pool.query(
      `insert into test_question_options (question_id, name) 
                values ?`,
      [data],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getQuestionsFromTestIdAdmin: (test_id, callBack) => {
    pool.query(
      `select q.id as id, q.question as question, q.answer as answer, q.type as type, q.marks as marks, qo.name as options from ${questionTable} as q LEFT JOIN test_question_options as qo ON q.id = qo.question_id where q.test_id=?`,
      [test_id],
      (error, results) => {
        if (error) {
          callBack(error);
        }
        var finalResults = _.chain(results)
          .groupBy("id")
          .map(function (v, i) {
            return {
              id: i,
              question: _.get(_.find(v, "question"), "question"),
              answer: _.get(_.find(v, "answer"), "answer"),
              type: _.get(_.find(v, "type"), "type"),
              marks: _.get(_.find(v, "marks"), "marks"),
              options: _.reduce(
                v,
                function (acc, obj) {
                  var { options } = obj;
                  if (!_.isNull(options)) {
                    acc.push(options);
                  }
                  return acc;
                },
                []
              )
            };
          })
          .value();
        return callBack(null, finalResults);
      }
    );
  },
  getChaptersFromTestId: (test_id, callBack) => {
    pool.query(
      `select chapter_id from tests_chapters where test_id = ?`,
      [test_id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }

        return callBack(null, results);
      }
    );
  },
  editTestAdmin: ({ id, subject_id, type, name, marks }, callBack) => {
    pool.query(
      `update ${table} SET subject_id = ?, type = ?, name = ?, marks = ? where id = ?`,
      [
        subject_id,
        type,
        name,
        marks,
        id
      ],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  deleteChaptersFromTestAdmin: (test_id, callBack) => {
    // Delete results if exist
    pool.query(`delete from tests_chapters where test_id = ? `, [
      test_id
    ],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  deleteQuestionsFromTestAdmin: (test_id, callBack) => {
    // Delete results if exist
    pool.query(`delete from test_questions where test_id = ? `,
      [
        test_id
      ],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );

  },
};
