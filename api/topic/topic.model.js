const pool = require("../../config/database");
const table = "topics";
const completedTopicTable = "topic_completed_by_user";

module.exports = {
  getTopicsFromChapter: ({ user_id, chapter_id }, callBack) => {
    pool.query(
      `select t.id as id, t.topic_no as topic_no, t.topic_name as topic_name, t.video_url as video_url, t.meta_text as meta_text, t.meta_description as meta_description, t.is_free as is_free,  
      if((select count(*) from ${completedTopicTable} as tcbu where tcbu.topic_id = t.id and tcbu.user_id = ?) > 0, true, false) as is_completed from ${table} as t where chapter_id = ? AND is_active =1`,
      [user_id, chapter_id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getCompletedTopics: ({ user_id, subject_id }, callBack) => {
    pool.query(
      `select  std.name as standard, sub.name as subject, c.chapter_no as chapter_no, c.chapter_name as chapter_name, t.id as topic_id, t.topic_no as topic_no, t.topic_name as topic_name,t.video_url as video_url, t.meta_text as meta_text, t.meta_description as meta_description, t.is_free as is_free, tcbu.completed_at as completed_at from ${completedTopicTable} as tcbu 
      JOIN ${table} as t ON tcbu.topic_id = t.id 
      JOIN chapters as c ON t.chapter_id = c.id 
      JOIN subjects as sub ON c.subject_id = sub.id 
      JOIN standards as std ON sub.standard_id = std.id 
      where tcbu.user_id = ? and sub.id = ?`,
      [user_id, subject_id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getUnCompletedTopics: (
    { user_id, subject_id, completedTopicsIds },
    callBack
  ) => {
    var query = `select std.name as standard, sub.name as subject, c.chapter_no as chapter_no, c.chapter_name as chapter_name, t.id as topic_id, t.topic_no as topic_no, t.topic_name as topic_name,t.video_url as video_url, t.meta_text as meta_text, t.meta_description as meta_description, t.is_free as is_free from ${table} as t 
    JOIN chapters as c ON t.chapter_id = c.id
    JOIN subjects as sub ON c.subject_id = sub.id
    JOIN standards as std ON sub.standard_id = std.id
    JOIN users as u ON u.standard_id = std.id
    where u.id = ? and sub.id = ?`;
    if (completedTopicsIds.length > 0) {
      query += `and t.id NOT IN(${completedTopicsIds})`;
    }

    pool.query(query, [user_id, subject_id], (error, results) => {
      if (error) {
        return callBack(error);
      }
      return callBack(null, results);
    });
  },
  completeTopic: ({ user_id, topic_id }, callBack) => {
    pool.query(
      `insert into ${completedTopicTable} (user_id, topic_id) values (?,?)`,
      [user_id, topic_id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  deleteCompletedTopicIfExist: ({ user_id, topic_id }, callBack) => {
    pool.query(
      `delete from ${completedTopicTable} where user_id = ? and topic_id = ?`,
      [user_id, topic_id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getTopicsAdmin: callBack => {
    pool.query(
      `select t.id as id, std.name as standard, sub.name as subject, c.chapter_name as chapter, t.topic_no as topic_no, t.topic_name as topic_name, t.is_active as is_active from ${table} t JOIN chapters c ON t.chapter_id = c.id JOIN subjects sub ON c.subject_id = sub.id JOIN standards std ON std.id = sub.standard_id`,
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
  createTopicAdmin: ({ chapter_id, topic_no, topic_name, video_url, meta_text, meta_description, is_free }, callBack) => {
    is_free = typeof is_free == 'undefined' ? 0 : is_free;
    pool.query(
      `insert into ${table} (chapter_id, topic_no, topic_name, video_url, meta_text, meta_description, is_free) 
                values(?,?,?,?,?,?,?)`,
      [
        chapter_id,
        topic_no,
        topic_name,
        video_url,
        meta_text,
        meta_description,
        is_free
      ],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getTopicFromIdAdmin: (id, callBack) => {
    pool.query(
      `select id, chapter_id, topic_no, video_url, topic_name, meta_text, meta_description, is_free from ${table} where id=?`,
      [id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  editTopicAdmin: ({ chapter_id, topic_no, topic_name, video_url, meta_text, meta_description, is_free, id }, callBack) => {
    pool.query(
      `update ${table} SET chapter_id = ?, topic_no = ?, topic_name = ?, video_url = ?,meta_text = ?, meta_description = ?, is_free = ?  where id = ?`,
      [
        chapter_id,
        topic_no,
        topic_name,
        video_url,
        meta_text,
        meta_description,
        is_free,
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
  deleteTopicAdmin: (id, callBack) => {
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
