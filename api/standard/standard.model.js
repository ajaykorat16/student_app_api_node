const pool = require("../../config/database");
const standardTable = "standards";

module.exports = {
  getStandards: callBack => {
    pool.query(`select id, name from ${standardTable} where is_active=1`, [], (error, results) => {
      if (error) {
        callBack(error);
      }
      return callBack(null, results);
    });
  },
  getStandardFromId: (id, callBack) => {
    pool.query(
      `select * from ${standardTable} where id=? and is_active =1`,
      [id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  changeStatus: (id, callBack) => {
    pool.query(
      `update ${standardTable} SET is_active = !is_active where id = ?`,
      [id],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getStandardsAdmin: callBack => {
    pool.query(`select * from ${standardTable}`, [], (error, results) => {
      if (error) {
        callBack(error);
      }
      return callBack(null, results);
    });
  },
  createStandardAdmin: (standard, callBack) => {
    pool.query(
      `insert into ${standardTable} (name) 
                values(?)`,
      [
        standard
      ],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  editStandardAdmin: ({ standard_id, standard }, callBack) => {
    pool.query(
      `update ${standardTable} SET name = ? where id = ?`,
      [
        standard,
        standard_id
      ],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  deleteStandardAdmin: (id, callBack) => {
    pool.query(
      `delete from ${standardTable} where id = ?`,
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
  checkStandrardWithSubject: (standard_id, subject_id, callBack) => {
    pool.query(`select * from subjects where id = ? AND standard_id = ? AND is_active=1`, [subject_id, standard_id], (error, results) => {
      if (error) {
        return callBack(error);
      }
      return callBack(null, results);
    });
  },
};
