const express = require('express')
const router = new express.Router()
const auth = require("../middleware/auth");


router.get('/game/', auth, (req, res)=>{
	res.render('game/index', {
		"user": req.user
	})
})

module.exports = router;
