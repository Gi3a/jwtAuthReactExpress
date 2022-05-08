// Data Trasnfer Object
module.exports = class UserDto {
	email;
	id;
	isActivated;

	constructor(model) {
		this.email = model.email;
		this.id = model._id; // mongodb is include _ to id;
		this.isActivated = model.isActivated;
	}
}