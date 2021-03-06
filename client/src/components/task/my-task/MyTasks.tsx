import React, { useEffect, useState } from "react";
import { Task } from "../../../types/task";
import { Type, Calendar } from "../../calendar/Calendar";
import { ConnectionManager } from "../../../managers/connetion/connectionManager";
import {
	RequestType,
	ResponseMessage,
	ResponseCode,
} from "../../../types/requests";
import { useDispatch, useSelector } from "react-redux";
import { setTasks, selectMyTask } from "../../../redux/slicers/taskSlice";
import { selectAccount } from "../../../redux/slicers/accountSlice";
import { Empty, Radio } from "antd";
import { TimersManager } from "../../../managers/timersManager";
import { RadioChangeEvent } from "antd/lib/radio";
import { CALLBACK_UPDATE_MY_TASK } from "../../../types/constants";
import {
	CSSTransition,
	TransitionGroup,
	SwitchTransition,
} from "react-transition-group";

import "./animate.min.css";

export const MyTasks: React.FC = () => {
	const dispatch = useDispatch();
	const accState = useSelector(selectAccount);
	const [calendarTypeState, setCalendarTypeState] = useState(Type.WEEK);
	const [changedAnimation, setChangedAnimation] = useState(false);

	useEffect(() => {
		ConnectionManager.getInstance().registerResponseHandler(
			RequestType.GET_MY_TASKS,
			(data) => {
				const dataMessage = data as ResponseMessage<Array<Task>>;
				if (dataMessage.requestCode === ResponseCode.RES_CODE_INTERNAL_ERROR) {
					console.log(`Error: ${dataMessage.requestCode}`);
					return;
				}
				console.log(data);
				dispatch(setTasks(dataMessage.data));
			}
		);
		TimersManager.getInstance().subscribeCallback(
			CALLBACK_UPDATE_MY_TASK,
			3000,
			() => {
				ConnectionManager.getInstance().emit(
					RequestType.GET_MY_TASKS,
					{},
					accState.session
				);
			}
		);
		return () => {
			TimersManager.getInstance().clearCallback(CALLBACK_UPDATE_MY_TASK);
		};
	}, []);

	const onRadioChange = (e: RadioChangeEvent) => {
		setCalendarTypeState(e.target.value);
		setChangedAnimation(true);
	};

	const myTaskState = useSelector(selectMyTask);

	if (myTaskState.length === 0) {
		return <Empty style={{ paddingTop: "10%" }} />;
	}
	console.log("TEST TES", changedAnimation);

	return (
		<div>
			<Radio.Group
				defaultValue={Type.WEEK}
				size="small"
				style={{ marginTop: 16 }}
				onChange={onRadioChange}
			>
				<Radio.Button value={Type.WEEK}>Тиждень</Radio.Button>
				<Radio.Button value={Type.MONTH}>Місяць</Radio.Button>
				<Radio.Button value={Type.HALF_YEAR}>Півріччя</Radio.Button>
			</Radio.Group>
			{/*
				<CSSTransition
					timeout={400}
					classNames="calendar"
					onEnter={() => console.log("Enter")}
					onExited={() => console.log("Exit")}
					unmountOnExit
				> */}
			<Calendar type={calendarTypeState} tasks={myTaskState}></Calendar>
		</div>
	);
};
