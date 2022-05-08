const UserModel = require('../models/user-model');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');

class UserService {
	async registration(email, password) {
		const candidate = await UserModel.findOne({ email })
		if (candidate) {
			throw ApiError.BadRequest(`Пользователь с почтовым адрессом ${email} уже существует`);
		}
		// Generate password and activation link
		const hashPassword = await bcrypt.hash(password, 3); // 3 - salt
		const activationLink = uuid.v4(); // v34fa-asfasf-142saf-sa-asf

		// Save user in db and send email
		const user = await UserModel.create({ email, password: hashPassword, activationLink })
		await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

		// Generate tokens, save refresh token to db and return tokens
		const userDto = new UserDto(user); // data transfer object, to cut password from data, id email isActivated
		const tokens = tokenService.generateTokens({ ...userDto }); // waiting instance of user
		await tokenService.saveToken(userDto.id, tokens.refreshToken);

		return { ...tokens, user: userDto }
	}

	async activate(activationLink) {
		const user = await UserModel.findOne({ activationLink });
		if (!user) {
			throw ApiError.BadRequest(`Некорректная ссылка активации`);
		}
		user.isActivated = true;
		user.activationLink = '';
		await user.save();
	}

	async login(email, password) {
		const user = await UserModel.findOne({ email })
		if (!user) {
			throw ApiError.BadRequest('Пользователь с таким email не найден')
		}
		const isPassEquals = await bcrypt.compare(password, user.password);
		if (!isPassEquals) {
			throw ApiError.BadRequest('Неверный пароль');
		}
		const userDto = new UserDto(user);
		const tokens = tokenService.generateTokens({ ...userDto });

		await tokenService.saveToken(userDto.id, tokens.refreshToken);
		return { ...tokens, user: userDto }
	}

	async logout(refreshToken) {
		const token = await tokenService.removeToken(refreshToken);
		return token;
	}

	async refresh(refreshToken) {
		// if u dont login
		if (!refreshToken) {
			throw ApiError.UnauthorizedError();
		}
		// check token for date, access, corretly
		const userData = tokenService.validateRefreshToken(refreshToken);
		// Find token in db
		const tokenFromDb = await tokenService.findToken(refreshToken);
		if (!userData || !tokenFromDb) {
			throw ApiError.UnauthorizedError();
		}
		// Update info about user
		const user = await UserModel.findById(userData.id);
		const userDto = new UserDto(user);
		const tokens = tokenService.generateTokens({ ...userDto });

		await tokenService.saveToken(userDto.id, tokens.refreshToken);
		return { ...tokens, user: userDto }
	}

	async getAllUsers() {
		const users = await UserModel.find();
		return users;
	}
}

module.exports = new UserService();