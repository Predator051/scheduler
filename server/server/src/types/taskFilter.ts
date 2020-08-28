import { TaskStatus } from "./task";

export interface TaskFilters {
	nameReg?: string;
	authorIds?: number[];
	executorIds?: number[];
	betweenDates?: {
		start: Date;
		end: Date;
	};
	status?: TaskStatus;
	private?: boolean;
}