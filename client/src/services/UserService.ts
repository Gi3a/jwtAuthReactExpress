import { AxiosResponse } from "axios";
import $api from "../http";
import { IUser } from "../models/IUser";

export default class UserSerivce {
	static fetchUsers(): Promise<AxiosResponse<IUser[]>> {
		//<> - genereic
		return $api.get<IUser[]>('/users')
	}
}