require("dotenv").config();
const express = require("express");
const cors = require('cors');
const app = express();
const authRouter = require("./api/authentication/auth.router");
const commonRouter = require("./api/common/common.router");
const chapterRouter = require("./api/chapter/chapter.router");
const testRouter = require("./api/test/test.router");
const userRouter = require("./api/user/user.router");
const topicRouter = require("./api/topic/topic.router");
const adminRouter = require("./api/admin/admin.router");

app.use(express.json());
app.use(cors());

//Define main routes
app.use("/api", commonRouter);
app.use("/api/chapters", chapterRouter);
app.use("/api/tests", testRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/topic", topicRouter);
app.use("/api/admin", adminRouter);

const port = process.env.APP_PORT || 4000;
app.listen(port, () => {
  console.log("server up and running on PORT :", port);
});
