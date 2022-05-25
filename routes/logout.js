var express = require("express");
var router = express.Router();

/* POST user logout */
router.post("/", async (req, res) => {
  try {
    await req.session.destroy();
    return res.sendStatus(200);
  } catch (e) {
    console.error(e);
    return res.sendStatus(500);
  }
});

module.exports = router;
