const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');

router.get(
	'/',
	catchAsync(async (req, res) => {
		const campgrounds = await Campground.find({});
		res.render('campgrounds/index', { campgrounds });
	})
);

router.get('/new', isLoggedIn, (req, res) => {
	res.render('campgrounds/new');
});

router.post(
	'/',
	isLoggedIn,
	validateCampground,
	catchAsync(async (req, res, next) => {
		//if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
		const campground = new Campground(req.body.campground);
		// 锁定目前登陆的账户ID，且更新数据库中ID为目前登陆的ID。
		campground.author = req.user._id;
		await campground.save();
		req.flash('success', 'Successfully made a new campground!');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

router.get(
	'/:id',
	catchAsync(async (req, res) => {
		const { id } = req.params;
		//因为创建campground的author和创建review的author是不一样的，所以需要分开进行populate。
		const campground = await Campground.findById(id)
			.populate({
				path: 'reviews',
				populate: {
					path: 'author'
				}
			})
			.populate('author');
		console.log(campground);
		if (!campground) {
			req.flash('error', 'Cannot find that campground!');
			return res.redirect('/campgrounds');
		}
		res.render('campgrounds/show', { campground });
	})
);

router.get(
	'/:id/edit',
	isLoggedIn,
	isAuthor,
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		if (!campground) {
			req.flash('error', 'Cannot find that campground!');
			return res.redirect('/campgrounds');
		}
		res.render('campgrounds/edit', { campground });
	})
);

router.put(
	'/:id',
	isLoggedIn,
	isAuthor,
	validateCampground,
	catchAsync(async (req, res) => {
		const { id } = req.params;

		//find the campground and check if the id is the same
		const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
		req.flash('success', 'Successfully updated campground!');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

router.delete(
	'/:id',
	isLoggedIn,
	isAuthor,
	catchAsync(async (req, res) => {
		const id = req.params.id;
		await Campground.findByIdAndDelete(id);
		req.flash('success', 'Successfully deleted campground!');
		res.redirect('/campgrounds');
	})
);

module.exports = router;
