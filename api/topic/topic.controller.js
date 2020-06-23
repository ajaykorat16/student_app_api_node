const {
  getCompletedTopics,
  getUnCompletedTopics,
  completeTopic,
  deleteCompletedTopicIfExist
} = require("./topic.model");

function completedTopics(user_id, subject_id) {
  return new Promise((resolve, reject) => {
    getCompletedTopics({ user_id, subject_id }, (err, results) => {
      if (err) {
        reject("Error in topics, please try again later");
      }
      resolve(results.map(value => value.topic_id));
    });
  });
}

function deleteCompletedIfExist(user_id, topic_id) {
  return new Promise((resolve, reject) => {
    deleteCompletedTopicIfExist({ user_id, topic_id }, (err, results) => {
      if (err) {
        reject("Error in topics, please try again later");
      }
      resolve("Done");
    });
  });
}

module.exports = {
  getCompletedTopics: (req, res) => {
    const { id: user_id } = req.decoded.result;
    const { subject_id } = req.query;

    getCompletedTopics({ user_id, subject_id }, (err, results) => {
      if (err) {
        return res.json({
          success: 0,
          message: "Database issue please try again later"
        });
      }

      return res.json({
        success: 1,
        message: "Your request went through successfully",
        data: results
      });
    });
  },
  getUnCompletedTopics: async (req, res) => {
    const { id: user_id } = req.decoded.result;
    const { subject_id } = req.query;

    const errHandler = err => {
      return res.json({
        success: 0,
        message: err
      });
    };
    const completedTopicsIds = await completedTopics(user_id, subject_id).catch(
      errHandler
    );

    getUnCompletedTopics(
      { user_id, subject_id, completedTopicsIds },
      (err, results) => {
        if (err) {
          return res.json({
            success: 0,
            message: "Database issue please try again later"
          });
        }

        return res.json({
          success: 1,
          message: "Your request went through successfully",
          data: results
        });
      }
    );
  },
  completeTopic: async (req, res) => {
    const { id: user_id } = req.decoded.result;
    const { topic_id } = req.body;

    const errHandler = err => {
      return res.json({
        success: 0,
        message: err
      });
    };
    await deleteCompletedIfExist(user_id, topic_id).catch(errHandler);

    completeTopic({ user_id, topic_id }, (err, results) => {
      if (err) {
        return res.json({
          success: 0,
          message: "Database issue please try again later"
        });
      }

      return res.json({
        success: 1,
        message: "Topic completed successfully"
      });
    });
  }
};
