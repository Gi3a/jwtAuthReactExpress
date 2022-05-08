const e = require('express');
const jwt = require('jsonwebtoken');
const tokenModel = require('../models/token-model');

class TokenService {
	generateTokens(payload) {
		const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '30m' });
		const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
		return {
			accessToken,
			refreshToken
		}
	}

	async saveToken(userId, refreshToken) {
		// if you are logged in from one device and then from another, then it will delete the previous devices
		const tokenData = await tokenModel.findOne({ user: userId });
		if (tokenData) {
			tokenData.refreshToken = refreshToken;
			return tokenData.save();
		}
		// if the token is not found, create a new one
		const token = await tokenModel.create({ user: userId, refreshToken });
		return token;
	}

	async removeToken(refreshToken) {
		const tokenData = await tokenModel.deleteOne({ refreshToken });
		return tokenData;
	}

	async findToken(refreshToken) {
		const tokenData = await tokenModel.findOne({ refreshToken });
		return tokenData;
	}

	validateAccessToken(token) {
		try {
			const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
			return userData;
		} catch (e) {
			return null;
		}
	}

	validateRefreshToken(token) {
		try {
			const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
			return userData;
		} catch (e) {
			return null;
		}
	}

}

module.exports = new TokenService();