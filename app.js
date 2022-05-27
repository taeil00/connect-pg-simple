var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var registerRouter = require("./routes/register");
var loginRouter = require("./routes/login");
var logoutRouter = require("./routes/logout");
var fetchuserRouter = require("./routes/fetchuser");

var app = express();

//express-session
const session = require("express-session");
const pg = require("./model/pg");
const pgSession = require("connect-pg-simple")(session);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// session
// 라우터 설정보다 앞에 있어야 함
app.use(
  session({
    store: new pgSession({
      pool: pg,
      createTableIfMissing: true,
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 4 }, //4 hours
    secret: "hcp", //암호화할때 쓰는키
    resave: false, //세션을 언제나 저장할지 여부
    rolling: true, //매 응답마다 쿠키 시간 초기화
    saveUninitialized: true, //세션이 저장되기 전 uninitialized상태로 미리 만들어저장할지 여부
  })
);

// 라우터 설정
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/logout", logoutRouter);
app.use("/fetchuser", fetchuserRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

//db접속
// pgPool.connect((err) => {
//   if (err) {
//     console.log("Failed to connect db" + err);
//   } else {
//     console.log("Connect to db done!");
//   }
// });

module.exports = app;
