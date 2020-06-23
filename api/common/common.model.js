const pool = require("../../config/database");
const review = "reviews";
const demoVideo = "demo_video";
const schoolResult = "school_result";
const subscriptions = "subscriptions";

module.exports = {
  postReview: ({ user_id, ratings, comment }, callBack) => {
    pool.query(
      `insert into ${review} (user_id, ratings, comment) values (?,?,?)`,
      [user_id, ratings, comment],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  demoVideo: callBack => {
    pool.query(`select * from ${demoVideo}`, [], (error, results, fields) => {
      if (error) {
        return callBack(error);
      }
      return callBack(null, results[0]);
    });
  },
  schoolResult: (
    { user_id, standard_id, subject_id, school_name, term, marks, city },
    callBack
  ) => {
    pool.query(
      `insert into ${schoolResult} (user_id, standard_id, subject_id, school_name, term, marks, city) values (?,?,?,?,?,?, ?)`,
      [user_id, standard_id, subject_id, school_name, term, marks, city],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  postSubscription: (subscription_info, callBack) => {
    pool.query(
      `insert into ${subscriptions} (user_id, subject_id, transaction_id, amount, promocode) values ?`,
      [subscription_info],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  checkIfSubscriptionIsAvailable: ({ user_id, subject_ids }, callBack) => {
    pool.query(
      `select * from ${subscriptions} where user_id = ? and subject_id IN (?)`,
      [user_id, subject_ids],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  listSchoolResults: (user_id, callBack) => {
    pool.query(`select std.name as standard, sub.name as subject, sr.school_name as school_name, sr.term as term, sr.marks as marks, sr.city as city from ${schoolResult} sr JOIN standards as std ON sr.standard_id = std.id JOIN subjects as sub ON sr.subject_id = sub.id where sr.user_id = ? `, [user_id], (error, results, fields) => {
      if (error) {
        callBack(error);
      }
      return callBack(null, results);
    });
  },
  getSubscribedSubjectFromUser: (user_id, callBack) => {
    pool.query(`select * from ${subscriptions} where user_id = ? `, [user_id], (error, results, fields) => {
      if (error) {
        return callBack(error);
      }
      return callBack(null, results);
    });
  },
  getReviewsAdmin: callBack => {
    pool.query(
      `select u.first_name as name, r.ratings as ratings, r.comment as comment from reviews r JOIN users u ON r.user_id = u.id`,
      [],
      (error, results, fields) => {
        console.log(error);

        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  listSchoolResultsAdmin: callBack => {
    pool.query(`select u.first_name as student, std.name as standard, sub.name as subject, sr.school_name as school_name, sr.term as term, sr.marks as marks, sr.city as city from ${schoolResult} sr JOIN users as u ON sr.user_id = u.id JOIN standards as std ON sr.standard_id = std.id JOIN subjects as sub ON sr.subject_id = sub.id`, [], (error, results, fields) => {
      if (error) {
        return callBack(error);
      }
      return callBack(null, results);
    });
  },
  getPromocodeByName: (promocode, callBack) => {
    pool.query(`select * from teachers where promocode = ?`, [promocode], (error, results, fields) => {
      if (error) {
        return callBack(error);
      }
      return callBack(null, results);
    });
  },
  getTeachersAdmin: callBack => {
    pool.query(`select id, name, age, gender, qualification, post, address, promocode, phone, address from teachers`, [], (error, results, fields) => {
      if (error) {
        return callBack(error);
      }
      return callBack(null, results);
    });
  },
  createTeacherAdmin: ({ name, promocode, age, gender, qualification, post, address, phone }, callBack) => {
    pool.query(
      `insert into teachers (name, promocode, age, gender, qualification, post, phone, address) values(?,?,?,?,?,?,?,?)`,
      [
        name,
        promocode,
        age,
        gender,
        qualification,
        post,
        phone,
        address
      ],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getTeacherFromIdAdmin: (id, callBack) => {
    pool.query(`select id, name, age, gender, qualification, post, phone, address, promocode from teachers where id = ?`, [id], (error, results, fields) => {
      if (error) {
        return callBack(error);
      }
      return callBack(null, results[0]);
    });
  },
  editTeacherAdmin: ({ name, promocode, age, gender, qualification, post, phone, address, id }, callBack) => {
    pool.query(
      `update teachers SET name = ?, promocode = ?, age = ?, gender = ?, qualification = ?, post = ?, phone = ?,address = ? where id = ?`,
      [
        name,
        promocode,
        age,
        gender,
        qualification,
        post,
        phone,
        address,
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
  deleteTeacherAdmin: (id, callBack) => {
    pool.query(
      `delete from teachers where id = ?`,
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
  getDemoVideoFromIdAdmin: (id, callBack) => {
    pool.query(`select id, video_url from demo_video where id = ?`, [id], (error, results, fields) => {
      if (error) {
        return callBack(error);
      }
      return callBack(null, results[0]);
    });
  },
  editDemoVideoAdmin: ({ video_url, id }, callBack) => {
    pool.query(
      `update demo_video SET video_url = ? where id = ?`,
      [
        video_url,
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
  getSubscribedUsersAdmin: callBack => {
    pool.query(
      `select count(distinct(u.id)) as subscribed_users from users u JOIN subscriptions sub ON sub.user_id = u.id`,
      [],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  getUnSubscribedUsersAdmin: callBack => {
    pool.query(
      `select count(*) as unSubscribed_users from users u LEFT JOIN subscriptions sub ON sub.user_id = u.id where u.role_id = 2 AND sub.id is null`,
      [],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  getSubscriptionValueAdmin: callBack => {
    pool.query(
      `select sub.name as subject, SUM(sus.amount) as amount from subscriptions sus JOIN subjects sub ON sus.subject_id = sub.id group by subject_id`,
      [],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getUniqueCitiesAdmin: callBack => {
    pool.query(
      `select distinct(city) as city from users where city !=""`,
      [],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getTeachersCountAdmin: callBack => {
    pool.query(
      `select count(*) as teachers_count from teachers`,
      [],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
};
