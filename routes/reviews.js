const express = require('express');
// mergeParams: true 是为了较为广泛的接受路径
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn } = require('../middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

router.post(
	'/',
	isLoggedIn,
	validateReview,
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body.review);
		review.author = req.user._id;
		campground.reviews.push(review);
		await review.save();
		await campground.save();
		req.flash('success', 'Created add a new review');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

router.delete(
	'/:reviewId',
	catchAsync(async (req, res) => {
		const { id, reviewId } = req.params;
		//$pull 根据reviewId，将这条review从全部的reviews中拉出去。来自mongo。
		await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
		await Review.findByIdAndDelete(reviewId);
		req.flash('success', 'Successfully deleted review');
		res.redirect(`/campgrounds/${id}`);
	})
);

module.exports = router;
