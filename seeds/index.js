const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('../seeds/cities');
const { places, descriptors } = require('../seeds/seedHelpers');

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

const sample = (arrary) => arrary[Math.floor(Math.random() * arrary.length)];

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 50; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20 + 10);
		const camp = new Campground({
			author: '616ff041a0975b1122cf639b',
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			description:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, deleniti optio! Recusandae ea veniam provident? Necessitatibus officiis quam laudantium doloribus, excepturi mollitia laborum natus repudiandae, perspiciatis, et laboriosam ducimus. Perspiciatis.',
			price,
			geometry: {
				type: 'Point',
				coordinates: [ cities[random1000].longitude, cities[random1000].latitude ]
			},
			images: [
				{
					url:
						'https://res.cloudinary.com/dlruca1nr/image/upload/v1634913421/YelpCamp/szfe5izlmgyo5zg1nnmy.jpg',
					filename: 'YelpCamp/szfe5izlmgyo5zg1nnmy'
				},
				{
					url:
						'https://res.cloudinary.com/dlruca1nr/image/upload/v1634913422/YelpCamp/cysm8pgrbbwvtlnooup7.png',
					filename: 'YelpCamp/cysm8pgrbbwvtlnooup7'
				}
			]
		});
		await camp.save();
	}
};

seedDB().then(() => {
	mongoose.connection.close();
});
