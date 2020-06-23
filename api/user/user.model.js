const pool = require("../../config/database");

module.exports = {
  create: (data, callBack) => {
    pool.query(
      `insert into users (standard_id, role_id, first_name, last_name, phone, email, password, address,age, gender, city, country, school_city, pincode, parent_income, student_blood_group, parent_occupation, school_name, type, created_at, updated_at) 
                values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())`,
      [
        data.standard_id,
        2,
        data.first_name,
        data.last_name,
        data.phone,
        data.email,
        data.password,
        data.address,
        data.age,
        data.gender,
        data.city,
        data.country,
        data.school_city,
        data.pincode,
        data.parent_income,
        data.student_blood_group,
        data.parent_occupation,
        data.school_name,
        data.type
      ],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  createOtp: ({ insertId, otp }, callBack) => {
    pool.query(
      `insert into user_otp (u_id, otp) 
                values(?,?)`,
      [insertId, otp],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getUserByUserEmail: (email, callBack) => {
    pool.query(
      `select * from users where email = ?`,
      [email],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  checkOtp: ({ user_id, otp }, callBack) => {
    pool.query(
      `select * from user_otp where u_id = ? && otp = ?`,
      [user_id, otp],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  getUserByUserPhone: (phone, callBack) => {
    pool.query(
      `select * from users where phone = ?`,
      [phone],
      (error, results) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  getUserByUserId: (id, callBack) => {
    pool.query(
      `select id,first_name, email,phone, type, standard_id, gender, city, is_active from users where id = ?`,
      [id],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  getUsers: callBack => {
    pool.query(
      `select id,first_name,last_name,email from users`,
      [],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  updateUserById: (id, data, callBack) => {
    pool.query(
      `update users set first_name=?, last_name=?, email=?, parent_occupation=?, school_name=?, age=?, gender=?, city=?, country=?, school_city=?, pincode=?, parent_income=?, student_blood_group=?, address=?, standard_id=?, type=?, phone=? where id = ?`,
      [
        data.first_name,
        data.last_name,
        data.email,
        data.parent_occupation,
        data.school_name,
        data.age,
        data.gender,
        data.city,
        data.country,
        data.school_city,
        data.pincode,
        data.parent_income,
        data.student_blood_group,
        data.address,
        data.standard_id,
        data.type,
        data.phone,
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
  deleteUser: (data, callBack) => {
    pool.query(
      `delete from registration where id = ?`,
      [data.id],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  deleteUserOtp: (u_id, callBack) => {
    //Delete from user otp
    pool.query(`delete from user_otp where u_id = ?`, [u_id],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  deleteFromOtp: (u_id, callBack) => {
    //Delete from user otp
    pool.query(`delete from user_otp where u_id = ?`, [u_id]);

    // Change status of user
    pool.query(
      `update users set isOTPverified=1 where id = ${u_id}`,
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  updatePassword: ({ email, newPassword }, isTempPass, callBack) => {
    // Change status of user
    pool.query(
      `update users set password=?, isTempPass=? where email = ?`,
      [newPassword, isTempPass, email],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  loginCheck: (user_id, callBack) => {
    pool.query(
      `select * from login_check where user_id = ?`,
      [user_id],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  addLoginCheck: (device_token, user_id, callBack) => {
    pool.query(
      `insert into login_check (user_id, device_token) 
                values(?,?)`,
      [user_id, device_token],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  checkDeviceTokenIsExist: ({ device_token, user_id }, callBack) => {
    pool.query(
      `select * from login_check where user_id = ? && device_token = ?`,
      [user_id, device_token],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  updateLoginTime: (device_token, user_id, callBack) => {
    // Change status of user
    pool.query(
      `update login_check set login_time=NOW() where user_id = ? AND device_token = ?`,
      [user_id, device_token],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  logoutFromUserId: (user_id, callBack) => {
    pool.query(
      `delete from login_check where user_id = ?`,
      [user_id],
      (error, results, fields) => {
        if (error) {
          callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  getStudents: callBack => {
    pool.query(
      `select std.name as standard, u.id as id, u.first_name as name, u.email as email, u.phone as phone, u.type as type, u.gender as gender, u.city as city, u.is_active as is_active from users u JOIN standards std ON u.standard_id = std.id where u.role_id = 2 ORDER BY u.first_name ASC`,
      [],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  changeStatus: (user_id, callBack) => {
    pool.query(
      `update users SET is_active = !is_active where id = ?`,
      [user_id],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
  getUserByUserIdForAdmin: (id, callBack) => {
    pool.query(
      `select u.first_name as Name, u.email as Email, u.phone as Phone, u.type as Type, std.name as Standard, u.gender as Gender, u.city as City, IF(u.is_active=1, 'Active', 'InActive') as Status from users u JOIN standards std ON u.standard_id = std.id where u.id = ?`,
      [id],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results[0]);
      }
    );
  },
  getSubscribedSubjectsOfUser: (id, callBack) => {
    pool.query(
      `select sub.name as subject from subscriptions sus JOIN subjects sub ON sus.subject_id = sub.id where sus.user_id = ?`,
      [id],
      (error, results, fields) => {
        if (error) {
          return callBack(error);
        }
        return callBack(null, results);
      }
    );
  },
};
