var express = require("express");
var router = express.Router();
const bcrypt = require("bcryptjs");

/* POST user login */
router.post("/", async (req, res) => {
  const { email, password } = req.body;

  if (email == null || password == null) {
    return res.sendStatus(403);
  }

  try {
    const data = await pgPool.query(
      "SELECT id, firstname, surname, email, password FROM users WHERE email = $1",
      [email]
    );

    if (data.rows.length === 0) {
      res.sendStatus(403);
    }

    const user = data.rows[0];

    const matches = bcrypt.compareSync(password, user.password);
    if (!matches) {
      return res.sendStatus(403);
    }

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
