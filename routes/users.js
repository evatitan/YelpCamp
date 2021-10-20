const express = require('express');
const passport = require('passport');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

router.get('/register', (req, res) => {
	res.render('users/register');
});

router.post(
	'/register',
	catchAsync(async (req, res) => {
		//res.send(req.body);
		try {
			const { email, username, password } = req.body;
			const user = new User({ email, username });
			const registerUser = await User.register(user, password);
			req.flash('success', 'welcome to yelpcamp');
			res.redirect('/campgrounds');
		} catch (e) {
			req.flash('error', e.message);
			res.redirect('register');
		}
	})
);

module.exports = router;
