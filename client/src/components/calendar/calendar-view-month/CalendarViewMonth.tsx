import React from "react";
import { Task, TaskPriority } from "../../../types/task";
import { Typography } from "antd";
import Timeline, {
	TimelineHeaders,
	DateHeader,
	SidebarHeader,
} from "react-calendar-timeline";
import "react-calendar-timeline/lib/Timeline.css";
import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import {
	RequestType,
	ResponseMessage,
	ResponseCode,
} from "../../../types/requests";
import Store from "../../../app/store";
import { User } from "../../../types/user";
import { TaskDrawer, TaskDrawerProps } from "../../task/TaskDrawer";

const { Text } = Typography;

interface TimeLineItem {
	id: number;
	group: number;
	title: string;
	start_time: Date;
	end_time: Date;
	canMove: boolean;
	canResize: boolean;
	canChangeGroup: boolean;
	data: any;
	itemProps?: any;
}

export class CalendarViewMonth extends React.Component<
	{
		tasks: Array<Task>;
	},
	{
		taskDrawer: TaskDrawerProps;
	}
> {
	constructor(props: any) {
		super(props);

		this.setState({
			taskDrawer: {
				visible: false,
				onClose: this.onItemDrawerClose.bind(this),
			},
		});
	}
	getStartEndOfMonth(): Date[] {
		var date = new Date(),
			y = date.getFullYear(),
			m = date.getMonth();
		var firstDay = new Date(y, m, 1);
		var lastDay = new Date(y, m + 1, 1);

		return [firstDay, lastDay];
	}
	ifTaskInDate(date: Date, task: Task): boolean {
		const one = date <= task.endDate;
		const two = date >= task.startDate;
		const result: boolean = one && two;
		return result;
	}

	ifTaskBetweenDates(start: Date, end: Date, task: Task) {
		const oneStart = new Date(task.startDate) <= end;
		const twoStart = new Date(task.startDate) >= start;

		const oneEnd = new Date(task.endDate) <= end;
		const twoEnd = new Date(task.endDate) >= start;

		const result: boolean = (oneStart && twoStart) || (oneEnd && twoEnd);
		return result;
	}

	formatDate(dateObject: Date) {
		const dayNum = dateObject.getDate();
		const monthNum = dateObject.getMonth() + 1;
		const yearNum = dateObject.getFullYear();
		const day: string =
			dayNum < 10 ? "0" + dayNum.toString() : dayNum.toString();
		const month: string =
			monthNum < 10 ? "0" + monthNum.toString() : monthNum.toString();
		const year: string = yearNum.toString().substr(0, 2);

		const lDate = new Date(`${month}.${day}.${year}`);
		return lDate;
	}

	onItemClicked(item: TimeLineItem) {
		const taskData = item.data as Task;

		ConnectionManager.getInstance().registerResponseOnceHandler(
			RequestType.GET_USERS_INFO,
			(data) => {
				const dataMessage = data as ResponseMessage<Array<User>>;
				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}

				let executer = dataMessage.data[0];
				let author = dataMessage.data[1];
				if (
					dataMessage.data[0].id === taskData.authorId &&
					executer.id !== author.id
				) {
					executer = dataMessage.data[1];
					author = dataMessage.data[0];
				}
				console.log("Recive users: ", executer, author);

				this.setState({
					taskDrawer: {
						...this.state.taskDrawer,
						executer: executer,
						author: author,
					},
				});
			}
		);

		ConnectionManager.getInstance().emit(
			RequestType.GET_USERS_INFO,
			[taskData.executerId, taskData.authorId],
			Store.getState().account.session
		);

		this.setState({
			taskDrawer: {
				visible: true,
				task: taskData,
				onClose: this.onItemDrawerClose.bind(this),
			},
		});
	}

	onItemDrawerClose() {
		this.setState({
			taskDrawer: {
				visible: false,
				onClose: this.onItemDrawerClose.bind(this),
			},
		});
	}

	render() {
		const [start, end] = this.getStartEndOfMonth();

		const items: TimeLineItem[] = this.props.tasks
			.filter((item) => {
				return this.ifTaskBetweenDates(start, end, item);
			})
			.map((task) => {
				const item: TimeLineItem = {
					id: task.id,
					group: task.id,
					title: task.title,
					start_time: this.formatDate(new Date(task.startDate)),
					end_time: this.formatDate(new Date(task.endDate)),
					canMove: true,
					canResize: false,
					canChangeGroup: false,
					data: {
						...task,
					},
				};
				const backgroundColor =
					task.priority === TaskPriority.RED
						? "#ff4d4f"
						: task.priority === TaskPriority.YELLOW
						? "#ffec3d"
						: "#52c41a";
				item.itemProps = {
					style: { backgroundColor: backgroundColor, borderRadius: "50px" },
					onMouseDown: this.onItemClicked.bind(this, item),
				};
				return item;
			});
		console.log(items);

		const groups = items.map((task) => {
			return { id: task.id, title: task.title };
		});

		return (
			<div>
				<Text strong>
					{start
						.toLocaleString("uk", { month: "long", year: "numeric" })
						.toUpperCase()}
				</Text>
				<Timeline
					groups={groups}
					items={items}
					minZoom={86400000}
					canMove={false}
					visibleTimeStart={start}
					visibleTimeEnd={end}
					itemRenderer={({
						item,
						itemContext,
						getItemProps,
						getResizeProps,
					}) => {
						const {
							left: leftResizeProps,
							right: rightResizeProps,
						} = getResizeProps();
						return (
							<div {...getItemProps(item.itemProps)}>
								{itemContext.useResizeHandle ? (
									<div {...leftResizeProps} />
								) : (
									""
								)}

								<div
									className="rct-item-content"
									style={{ maxHeight: `${itemContext.dimensions.height}` }}
								>
									{itemContext.title}
								</div>

								{itemContext.useResizeHandle ? (
									<div {...rightResizeProps} />
								) : (
									""
								)}
							</div>
						);
					}}
					groupRenderer={({ group }) => {
						return (
							<div
								style={{
									textAlign: "left",
								}}
							>
								<span
									style={{
										fontSize: 16,
									}}
								>
									{group.title}
								</span>
							</div>
						);
					}}
				>
					<TimelineHeaders className="sticky">
						<SidebarHeader>
							{({ getRootProps }) => {
								const style = getRootProps();
								style.style.backgroundColor = "#1890FF";
								return <div {...style}></div>;
							}}
						</SidebarHeader>
						<DateHeader
							labelFormat="DD"
							style={{
								height: 50,
								fontSize: 15,
								color: "#DFF0FF",
								backgroundColor: "#1890FF",
							}}
							intervalRenderer={(dateHeaderProps) => {
								return (
									<div {...dateHeaderProps?.getIntervalProps()}>
										{dateHeaderProps?.intervalContext.intervalText}
									</div>
								);
							}}
						/>
					</TimelineHeaders>
				</Timeline>
				<TaskDrawer {...this.state?.taskDrawer}></TaskDrawer>
			</div>
		);
	}
}
