module.exports = class ApiError extends Error {
	status;
	errors;

	constructor(status, message, errors = []) {
		super(message);// call parent constructor
		this.status = status;
		this.errors = errors;
	}

	// static can be used without creating an instance of the class
	static UnauthorizedError() {
		return new ApiError(401, 'Пользователь не авторизован')
	}

	// incorrect data, cant get validation etc
	static BadRequest(message, errors = []) {
		return new ApiError(400, message, errors);
	}
}