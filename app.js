//if (process.env.NODE_ENV !== 'production') {
//	require('dotenv').config();
//}
require('dotenv').config();
//console.log(process.env.SECRET);
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

//用于服务端也能准确无误的接受新创建和更改后的cambground，如果信息不完整，将会抛出错误。见post新创建， serve side validation with Joi
const Joi = require('joi');
const ExpressError = require('./utils/ExpressError');
//用于制作虚假的put请求
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const UserRoutes = require('./routes/users');

const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const MongoStore = require('connect-mongo');
//const MongoStore = require('connect-mongo');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
//const dbUrl = process.env.DB_URL;
//'mongodb://localhost:27017/yelp-camp'

//mongoose.connect('mongodb://localhost:27017/yelp-camp', {
//	useNewUrlParser: true,
//	useCreateIndex: true,
//	useUnifiedTopology: true
//  useFindAndModify: false
//});

mongoose
	.connect(dbUrl)
	.then(() => {
		console.log('Connection open');
	})
	.catch((err) => {
		console.log('Connection error');
		console.log(err);
	});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connected!');
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
//保证可以返回req.body
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({ replaceWith: '' }));
app.use(helmet({ contentSecurityPolicy: false }));

const store = MongoStore.create({
	mongoUrl: dbUrl,
	touchAfter: 24 * 60 * 60
});

store.on('error', function(e) {
	console.log('session store error', e);
});

const sessionConfig = {
	store: store,
	name: 'session',
	secret: process.env.SECRET || 'thisshouldbebettersecret!',
	resave: false,
	saveUninitialized: true,
	cookie: {
		//httpOnly: true,用于防止XSS
		httpOnly: true,
		//secure: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7
	}
};
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	//console.log(req.session);
	//console.log(req.query);
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

app.use('/', UserRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);

app.get('/', (req, res) => {
	res.render('home');
});

//设置默认回复给其他不存在的路径
app.all('*', (req, res, next) => {
	//res.send('404!!!');
	next(new ExpressError('Page Not Found', 404));
});

//用于捕获一切错误
app.use((err, req, res, next) => {
	const { statusCode = 500, message = 'Oh, Something went wrong!' } = err;
	if (!err.message) err.message = 'Oh, Something went wrong!';
	res.status(statusCode).render('error', { err });
	//res.status(statusCode).send(message);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Serving on port`);
});
