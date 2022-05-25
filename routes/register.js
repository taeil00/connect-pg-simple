var express = require("express");
var router = express.Router();
const bcrypt = require("bcryptjs"); //'bcryptjs' 모듈임. 그냥 bcrypt모듈이 아닌것에 유의
const pg = require("../model/pg");

/* POST user register */
router.post("/", async (req, res) => {
  const { firstname, surname, email, password } = req.body;

  if (
    firstname == null ||
    surname == null ||
    email == null ||
    password == null
  ) {
    return res.sendStatus(403);
  }

  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const data = await pg.query(
      "INSERT INTO users (firstname, surname, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
      [firstname, surname, email, hashedPassword]
    );

    if (data.rows.length === 0) {
      res.sendStatus(403);
    }

    const user = data.rows[0];
    console.log("user firstname :" + user.firstname);
    console.log("user surname :" + user.surname);

    req.session.user = {
      id: user.id,
      firstname: user.firstname,
      surname: user.surname,
      email: user.email,
    };

    req.statusCode(200);
    return res.json({ user: req.session.user });
  } catch (e) {
    console.error(e);
    return res.sendStatus(403);
  }
});

module.exports = router;
