const pool = require("../../config/database");

module.exports = {
  getSubjects: callBack => {
    pool.query(`select * from subjects where is_active=1`, [], (error, results) => {
      if (error) {
        return callBack(error);
      }
      return callBack(null, results);
    });
  },
  getSubjectsFromStandardId: (standard_id, callBack) => {
    pool.query(
      `select id, name from subjects where standard_id=? AND is_active = 1`,
      [standard_id],
      (error, results) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getSubjectsAdmin: callBack => {
    pool.query(`select sub.id as id, sub.name as subject, sub.is_active as is_active, sub.price as price, std.name as standard from subjects sub JOIN standards std ON std.id = sub.standard_id`, [], (error, results) => {
      if (error) {
        callBack(error);
      }
      return callBack(null, results);
    });
  },
  changeStatus: (id, callBack) => {
    pool.query(
      `update subjects SET is_active = !is_active where id = ?`,
      [id],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  createSubjectAdmin: ({ standard_id, subject, price }, callBack) => {
    pool.query(
      `insert into subjects (standard_id, name, price) 
                values(?,?,?)`,
      [
        standard_id,
        subject,
        price
      ],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getSubjectFromIdAdmin: (id, callBack) => {
    pool.query(
      `select id, standard_id, name as subject, price from subjects where id=?`,
      [id],
      (error, results) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  editSubjectAdmin: ({ standard_id, subject, price, id }, callBack) => {
    pool.query(
      `update subjects SET standard_id = ?, name = ?, price = ? where id = ?`,
      [
        standard_id,
        subject,
        price,
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
  deleteSubjectAdmin: (id, callBack) => {
    pool.query(
      `delete from subjects where id = ?`,
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
  getSubjectsForChapter: callBack => {
    pool.query(`select sub.id as id, CONCAT(std.name, ' => ', sub.name) subject from subjects sub JOIN standards std ON std.id = sub.standard_id`, [], (error, results) => {
      if (error) {
        callBack(error);
      }
      return callBack(null, results);
    });
  },
};
