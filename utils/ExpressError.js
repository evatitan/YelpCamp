//创建一个calss用于抛出错误
class ExpressError extends Error {
	constructor(message, stateCode) {
		super();
		this.message = message;
		this.stateCode = stateCode;
	}
}

module.exports = ExpressError;
