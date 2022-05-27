var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const bcrypt = require("bcryptjs");
var flash = require("express-flash");

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

//passport
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    function (email, password, done) {
      pg.query(
        "select * from users where email = $1",
        [email],
        function (err, result) {
          if (err) {
            console.log("SQL error");
            return done(null, false, { message: "sql error" });
          }

          if (result.rows.length > 0) {
            var matched = bcrypt.compareSync(password, result.rows[0].password);
            if (matched) {
              console.log("Successful login, ", result.rows[0]);
              return done(null, result.rows[0]);
            }
          }

          console.log("Bad username or password");
          return done(null, false, { message: "Bad username or password" });
        }
      );
    }
  )
);

// Store user information into session
passport.serializeUser(function (user, done) {
  return done(null, user);
});

//get user information out of session
passport.deserializeUser(function (id, done) {
  return done(null, id);
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// session
// (선언위치 중요)라우터 설정보다 앞에 있어야 함
app.use(
  session({
    store: new pgSession({
      pool: pg,
      createTableIfMissing: true,
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 4 }, //4 hours
    secret: "hcp", //암호화할때 쓰는키
    resave: false, //세션을 언제나 저장할지 여부
    //rolling: true, //매 응답마다 쿠키 시간 초기화
    saveUninitialized: true, //세션이 저장되기 전 uninitialized상태로 미리 만들어저장할지 여부
  })
);

// (선언 위치 중요) 라우터 app.use() 설정보다 위에 있어야 redirect시에도 req.user가 undefined되지 않으니 주의!
app.use(passport.initialize());
app.use(passport.session());

// 라우터 설정
app.use("/", indexRouter);
app.use("/users", usersRouter);
// app.use("/register", registerRouter);
// app.use("/login", loginRouter);
// app.use("/logout", logoutRouter);
// app.use("/fetchuser", fetchuserRouter);

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

//app.use(flash());
//passport app use

//db접속
// pgPool.connect((err) => {
//   if (err) {
//     console.log("Failed to connect db" + err);
//   } else {
//     console.log("Connect to db done!");
//   }
// });

module.exports = app;
