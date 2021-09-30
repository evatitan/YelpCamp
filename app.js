const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');

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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
	res.render('home');
});

app.get('/makeCampground', async (req, res) => {
	const camp = new Campground({ title: 'My Backyard', description: 'cheap camp' });
	await camp.save();
	res.send(camp);
});

app.listen(3000, () => {
	console.log('Listen on port 3000');
});
