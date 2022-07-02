const express = require('express');
const router = express.Router();

const { ensureAuth } = require('../config/auth');

router.get("/index", (req, res) => {
    res.render("index");
})
router.get("/dashboard", ensureAuth, (req, res) => {
    res.render("dashboard", { name: req.user.name })
})
module.exports = router