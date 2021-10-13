//以函数的方式捕获error
module.exports = (func) => {
	return (req, res, next) => {
		func(req, res, next).catch(next);
	};
};
