import axios from "axios";
import { makeAutoObservable } from "mobx";
import { API_URL } from "../http";
import { IUser } from "../models/IUser";
import { AuthResponse } from "../models/response/AuthResponse";
import AuthSerivce from "../services/AuthService";

export default class Store {
	user = {} as IUser;
	isAuth = false;
	isLoading = false;

	constructor() {
		makeAutoObservable(this);
	}

	setAuth(bool: boolean) {
		this.isAuth = bool;
	}

	setUser(user: IUser) {
		this.user = user;
	}

	setLoading(bool: boolean) {
		this.isLoading = bool;
	}

	async login(email: string, password: string) {
		try {
			const response = await AuthSerivce.login(email, password);
			console.log(response);
			// interceptor
			localStorage.setItem('token', response.data.accessToken);
			this.setAuth(true);
			this.setUser(response.data.user);
		} catch (e: unknown) {
			console.log(e);
			// console.log(e.response?.data?.message);
		}
	}

	async registration(email: string, password: string) {
		try {
			const response = await AuthSerivce.registration(email, password);
			console.log(response);
			// interceptor
			localStorage.setItem('token', response.data.accessToken);
			this.setAuth(true);
			this.setUser(response.data.user);
		} catch (e: unknown) {
			console.log(e);
			// console.log(e.response?.data?.message);
		}
	}

	async logout() {
		try {
			const response = await AuthSerivce.logout();
			console.log(response);
			// interceptor
			localStorage.removeItem('token');
			this.setAuth(false);
			this.setUser({} as IUser);
		} catch (e: unknown) {
			console.log(e);
			// console.log(e.response?.data?.message);
		}
	}

	async checkAuth() {
		this.setLoading(true);
		try {
			// check our authrozation
			const response = await axios.get<AuthResponse>(`${API_URL}/refresh`, { withCredentials: true })
			console.log(response);
			localStorage.setItem('token', response.data.accessToken);
			this.setAuth(true);
			this.setUser(response.data.user);
		} catch (e) {
			console.log(e);
		} finally {
			this.setLoading(false);
		}
	}
}