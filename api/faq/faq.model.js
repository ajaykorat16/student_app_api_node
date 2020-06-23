const pool = require("../../config/database");
const table = "faq";

module.exports = {
  getFaqsFromChapter: (chapter_id, callBack) => {
    pool.query(
      `select id, question, answer, type from ${table} where chapter_id=? and is_active=1`,
      [chapter_id],
      (error, results) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getFaqsAdmin: callBack => {
    pool.query(
      `select f.id as id, std.name as standard, sub.name as subject, c.chapter_name as chapter, f.type as type, f.question as question, f.answer as answer, f.is_active as is_active from ${table} f JOIN chapters c ON f.chapter_id = c.id JOIN subjects sub ON c.subject_id = sub.id JOIN standards std ON std.id = sub.standard_id`,
      [],
      (error, results) => {
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
  createFaqAdmin: ({ chapter_id, type, question, answer }, callBack) => {
    pool.query(
      `insert into ${table} (chapter_id, type, question, answer) values(?,?,?,?)`,
      [
        chapter_id,
        type,
        question,
        answer,
      ],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getFaqFromIdAdmin: (id, callBack) => {
    pool.query(
      `select id, chapter_id, type, question, answer from ${table} where id=?`,
      [id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  editFaqAdmin: ({ chapter_id, type, question, answer, id }, callBack) => {
    pool.query(
      `update ${table} SET chapter_id = ?, type = ?, question = ?, answer = ? where id = ?`,
      [
        chapter_id,
        type,
        question,
        answer,
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
  deleteFaqAdmin: (id, callBack) => {
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
};
