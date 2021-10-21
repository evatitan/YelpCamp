const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
	res.render('users/register');
};
module.exports.register = async (req, res) => {
	//res.send(req.body);
	try {
		const { email, username, password } = req.body;
		const user = new User({ email, username });
		const registerUser = await User.register(user, password);
		req.login(registerUser, (err) => {
			if (err) return next(err);
			req.flash('success', 'welcome to Yelp Camp!');
			res.redirect('/campgrounds');
		});
		req.flash('success', 'welcome to yelpcamp');
		res.redirect('/campgrounds');
	} catch (e) {
		req.flash('error', e.message);
		res.redirect('register');
	}
};
module.exports.renderLogin = (req, res) => {
	res.render('users/login');
	//req.flash('success', 'welcome back');
};

module.exports.login = (req, res) => {
	//res.render('users/login');
	req.flash('success', 'Welcome to back');
	const redirectUrl = req.session.returnTo || '/campgrounds';
	delete req.session.returnTo;
	res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
	req.logout();
	req.flash('success', 'Goodbye!');
	res.redirect('/campgrounds');
};
