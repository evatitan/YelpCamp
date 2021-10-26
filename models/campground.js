const mongoose = require('mongoose');
const { campgroundSchema } = require('../schemas');
const review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
	url: String,
	filname: String
});

ImageSchema.virtual('thumbnail').get(function() {
	return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema(
	{
		title: String,
		images: [ ImageSchema ],
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
	},
	opts
);

CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
	//return 'I am a popup';
	return ` <strong> <a href="/campgrounds/${this._id}"> ${this.title} </a> </strong>
	<p>${this.description.substring(0, 20)}...</p>`;
	//<a href="/campgrounds/${this._id}"> ${this.title}</a>
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
