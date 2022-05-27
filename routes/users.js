var express = require("express");
var router = express.Router();
var path = require("path");

const pg = require("../model/pg");
var passport = require("passport");
const bcrypt = require("bcryptjs");

router.get("/logout", function (req, res) {
  req.logout(function (err) {
    //req.logout need callback function
    if (err) {
      return next(err);
    }
    console.log("Log out complete!");
    res.redirect("/");
  });
});

function loggedIn(req, res, next) {
  console.log("req.user:" + req.user);

  if (req.user) {
    next();
  } else {
    //redirect to / when it's not logged in
    res.redirect("/users/login");
  }
}

router.get("/profile", loggedIn, function (req, res) {
  // req.user: passport middleware adds "user" object to HTTP req object
  console.log("req.user >" + req.user);

  res.sendFile(path.join(__dirname, "..", "public", "profile.html"));
});

function notLoggedIn(req, res, next) {
  if (!req.user) {
    next();
  } else {
    //when it logged in
    let firstname = req.user.firstname;
    res.redirect("/users/profile?name=" + firstname);
  }
}

// localhost:3000/users/login
router.get("/login", notLoggedIn, function (req, res) {
  //success is set true in sign up page
  res.sendFile(path.join(__dirname, "..", "public", "login.html"));
});

// localhost:3000/users/login
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "login?message=Incorrect+credentials",
    //failureFlash: true,
  }),
  function (req, res, next) {
    console.log("req.user ::: " + req.user);

    let firstname = req.user.firstname;
    console.log("firstname: ", firstname);
    res.redirect("/users/profile?name=" + firstname); // Successful. redirect to localhost:3000/users/profile
  }
);

router.get("/signup", function (req, res) {
  // If logged in, go to profile page
  if (req.user) {
    let firstname = req.user.firstname;
    return res.redirect("/users/profile?name=" + firstname);
  }
  res.sendFile(path.join(__dirname, "..", "public", "signup.html"));
});

function createUser(req, res, next) {
  const { firstname, surname, email, password } = req.body;

  console.log("firstname:" + firstname);
  console.log("surname:" + surname);
  console.log("email:" + email);
  console.log("password:" + password);

  // if (
  //   firstname == null ||
  //   surname == null ||
  //   email == null ||
  //   password == null
  // ) {
  //   return res.sendStatus(403);
  // }

  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    pg.query(
      "INSERT INTO users (firstname, surname, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
      [firstname, surname, email, hashedPassword],
      function (err, result) {
        if (err) {
          console.log("unable to query INSERT");
          return next(err); // throw error to error.hbs.
        }

        console.log("User creation is successful");
        res.redirect(
          "/users/login?message=We+created+your+account+successfully!"
        );
      }
    );
  } catch (e) {
    console.error(e);
    return res.sendStatus(403);
  }
}

router.post("/signup", function (req, res, next) {
  console.log("email :" + req.body.email);

  pg.query(
    "SELECT * FROM users WHERE email=$1",
    [req.body.email],
    function (err, result) {
      if (err) {
        console.log("sql error ");
        next(err); // throw error to error.hbs.
      } else if (result.rows.length > 0) {
        console.log("user exists");
        res.redirect("/users/signup?error=User+exists");
      } else {
        console.log("no user with that name");
        createUser(req, res, next);
      }
    }
  );
});

module.exports = router;
