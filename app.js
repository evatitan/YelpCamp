const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
//用于服务端也能准确无误的接受新创建和更改后的cambground，如果信息不完整，将会抛出错误。见post新创建， serve side validation with Joi
const Joi = require('joi');

const ExpressError = require('./utils/ExpressError');
//用于制作虚假的put请求
const methodOverride = require('method-override');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

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

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
//保证可以返回req.body
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

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

app.listen(3000, () => {
	console.log('Listen on port 3000');
});
