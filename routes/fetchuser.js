var express = require("express");
var router = express.Router();

/* POST fetch user */
router.post("/", async (req, res) => {
  if (req.sessionID && req.session.user) {
    res.status(200);
    return res.json({ user: req.session.user });
  }

  return res.sendStatus(403);
});

module.exports = router;
