const pool = require("../../config/database");
const table = "chapters";

module.exports = {
  getChaptersFromSubjectId: (subject_id, callBack) => {
    pool.query(
      `select id, chapter_no, chapter_name from ${table} where subject_id=? AND is_active=1`,
      [subject_id],
      (error, results) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getChapterFromId: (chapter_id, callBack) => {
    pool.query(
      `select id, subject_id, chapter_no, chapter_name from ${table} where id=?`,
      [chapter_id],
      (error, results) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  getChaptersAdmin: callBack => {
    pool.query(
      `select c.id as id, std.name as standard, sub.name as subject, c.chapter_no as chapter_no, c.chapter_name as chapter_name, c.is_active as is_active from ${table} c  JOIN subjects sub ON c.subject_id= sub.id JOIN standards std ON sub.standard_id = std.id`,
      [],
      (error, results) => {
        if (error) {
          callBack(error);
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
  createChapterAdmin: ({ subject_id, chapter_no, chapter_name }, callBack) => {
    pool.query(
      `insert into chapters (subject_id, chapter_no, chapter_name) 
                values(?,?,?)`,
      [
        subject_id,
        chapter_no,
        chapter_name
      ],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getChapterFromIdAdmin: (id, callBack) => {
    pool.query(
      `select id, subject_id, chapter_no, chapter_name from ${table} where id=?`,
      [id],
      (error, results) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  editChapterAdmin: ({ subject_id, chapter_no, chapter_name, id }, callBack) => {
    pool.query(
      `update ${table} SET subject_id = ?, chapter_no = ?, chapter_name = ? where id = ?`,
      [
        subject_id,
        chapter_no,
        chapter_name,
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
  deleteChapterAdmin: (id, callBack) => {
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
  getChaptersForTopic: callBack => {
    pool.query(`select c.id as id, CONCAT(std.name, ' => ', sub.name, ' => ', c.chapter_name) chapter from ${table} c JOIN subjects sub ON sub.id = c.subject_id JOIN standards std ON std.id = sub.standard_id`, [], (error, results) => {
      if (error) {
        callBack(error);
      }
      return callBack(null, results);
    });
  }
};
