const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
	cloud_name: process.env.CLOUNDINARY_CLOUND_NAME,
	api_key: process.env.CLOUNDINARY_KEY,
	api_secret: process.env.CLOUNDINARY_SECRET
});

const storage = new CloudinaryStorage({
	cloudinary,
	params: {
		folder: 'YelpCamp',
		allowedFormats: [ 'jpeg', 'png', 'jpg' ]
	}
});

module.exports = {
	cloudinary,
	storage
};
