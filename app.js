const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
//用于服务端也能准确无误的接受新创建和更改后的cambground，如果信息不完整，将会抛出错误。见post新创建， serve side validation with Joi
const Joi = require('joi');
const { campgroundSchema, reviewSchema } = require('./schemas');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
//用于制作虚假的put请求
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');
const campground = require('./models/campground');

//mongoose.connect('mongoose://localhost:27017/yelp-camp', {
//	useNewUrlParser: true,
//	useCreateIndex: true,
//	useUnifiedTopology: true
//});

mongoose
	.connect('mongodb://localhost:27017/yelp-camp')
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

//创建一个schema midlleware 以便多处可以使用,其他地方只需要插入这个函数名称即可。
const validateCampground = (req, res, next) => {
	//此版块也可以放置在一个单独的文件中，不然此文件杂乱。存在文件：schemas.js中
	//const campgroundSchema = Joi.object({
	//	campground: Joi.object({
	//		title: Joi.string().required(),
	//		price: Joi.number().required().min(0),
	//		image: Joi.string().required(),
	//		location: Joi.string().required(),
	//		description: Joi.string().required()
	//	}).required()
	//});
	const result = campgroundSchema.validate(req.body);
	if (error) {
		const msg = error.detalis.map((el) => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	if (error) {
		const msg = error.detalis.map((el) => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
//保证可以返回req.body
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
	res.render('home');
});

app.get('/', (req, res) => {
	res.render('home');
});
app.get(
	'/campgrounds',
	catchAsync(async (req, res) => {
		const campgrounds = await Campground.find({});
		res.render('campgrounds/index', { campgrounds });
	})
);

app.get('/campgrounds/new', (req, res) => {
	res.render('campgrounds/new');
});

app.post(
	'/campgrounds',
	validateCampground,
	catchAsync(async (req, res, next) => {
		//if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
		const campground = new Campground(req.body.campground);
		await campground.save();
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

app.get(
	'/campgrounds/:id',
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findById(id).populate('reviews');
		res.render('campgrounds/show', { campground });
	})
);

app.get(
	'/campgrounds/:id/edit',
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		res.render('campgrounds/edit', { campground });
	})
);

app.put(
	'/campgrounds/:id',
	validateCampground,
	catchAsync(async (req, res) => {
		const id = req.params.id;
		const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

app.delete(
	'/campgrounds/:id',
	catchAsync(async (req, res) => {
		const id = req.params.id;
		await Campground.findByIdAndDelete(id);
		res.redirect('/campgrounds');
	})
);

app.post(
	'/campgrounds/:id/reviews',
	validateReview,
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body.review);
		campground.reviews.push(review);
		await review.save();
		await campground.save();
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

app.delete(
	'/campgrounds/:id/reviews/:reviewId',
	catchAsync(async (req, res) => {
		const { id, reviewId } = req.params;
		//$pull 根据reviewId，将这条review从全部的reviews中拉出去。来自mongo。
		await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
		await Review.findByIdAndDelete(reviewId);
		res.redirect(`/campgrounds/${id}`);
	})
);

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

app.listen(3000, () => {
	console.log('Listen on port 3000');
});

//test for github
