const mongoose = require('mongoose');
const { campgroundSchema } = require('../schemas');
const review = require('./review');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
	title: String,
	images: [
		{
			url: String,
			filename: String
		}
	],
	price: Number,
	description: String,
	geometry: {
		type: {
			type: String,
			enum: [ 'Point' ], // have to be point
			requireed: true
		},
		coordinates: {
			type: [ Number ],
			reqyuired: true
		}
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	location: String,
	reviews: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Review'
		}
	]
});
// query middleware for delete all reviews of one campground when this campground was be delete.来自mongoose
CampgroundSchema.post('findOneAndDelete', async function(doc) {
	if (doc) {
		await review.deleteMany({
			_id: {
				$in: doc.reviews
			}
		});
	}
});

module.exports = mongoose.model('Campground', CampgroundSchema);
