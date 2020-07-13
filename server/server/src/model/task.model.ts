import { Task, TaskPeriod, TaskPriority } from "../types/task";
import {
	ResponseMessage,
	ResponseCode,
	RequestMessage,
} from "../types/requests";
import { DBTaskManager } from "../managers/db_task_manager";
import { DBUserManager } from "../managers/db_user_manager";
import { User } from "../types/user";
import { UserModel } from "./user.model";

export class TaskModel {
	public static async createTask(
		request: RequestMessage<Task>
	): Promise<ResponseMessage<Task>> {
		const createdTask = await DBTaskManager.CreateTask(request.data);
		console.log(createdTask);
		if (createdTask !== undefined) {
			return {
				data: createdTask.ToRequestObject(),
				messageInfo: `test message`,
				requestCode: ResponseCode.RES_CODE_SUCCESS,
			};
		}

		return {
			data: {
				id: 0,
				authorId: 0,
				description: "",
				endDate: new Date(0),
				startDate: new Date(0),
				executerId: 0,
				period: TaskPeriod.ONCE,
				priority: TaskPriority.USUAL,
				title: "",
			},
			messageInfo: `test message`,
			requestCode: ResponseCode.RES_CODE_SUCCESS,
		};
	}

	public static async getTasksByExecuter(
		request: RequestMessage<any>
	): Promise<ResponseMessage<Task[]>> {
		const user = await DBUserManager.GetUserBySession(request.session);

		if (user !== undefined) {
			const executersTasks = await DBTaskManager.GetTasksByExecuterId(user.id);

			return {
				data: executersTasks.map((task) => {
					return task.ToRequestObject();
				}),
				messageInfo: "Success",
				requestCode: ResponseCode.RES_CODE_SUCCESS,
			};
		}

		return {
			data: [],
			messageInfo: `Session [${request.session}] incorrect`,
			requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
		};
	}

	public static async getTasksBySubbordinates(
		request: RequestMessage<Array<number>>
	): Promise<ResponseMessage<Task[]>> {
		let resTasks: Task[] = [];

		for (const sub_id of request.data) {
			const executersTasks = await DBTaskManager.GetTasksByExecuterId(sub_id);
			resTasks = resTasks.concat(
				executersTasks.map((i) => i.ToRequestObject())
			);
		}

		// const user = await DBUserManager.GetUserBySession(request.session);

		// if (user !== undefined) {
		// 	const executersTasks = await UserModel.getSubordinates(user.ToRequestObject());

		// 	return {
		// 		data: executersTasks.map((task) => {
		// 			return task.ToRequestObject();
		// 		}),
		// 		messageInfo: "Success",
		// 		requestCode: ResponseCode.RES_CODE_SUCCESS,
		// 	};
		// }

		return {
			data: resTasks,
			messageInfo: `SUCCESS`,
			requestCode: ResponseCode.RES_CODE_SUCCESS,
		};
	}
}
