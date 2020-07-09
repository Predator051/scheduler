import { Layout, Menu } from "antd";
import {
	PieChartOutlined,
	PlusCircleOutlined,
	GroupOutlined,
} from "@ant-design/icons";
import React, { useState } from "react";
import styles from "./menu.module.css";
import { UserMenu } from "../user/menu/UserMenu";
import { NavLink, Switch, Route } from "react-router-dom";
import { MyTasks } from "../mytask/MyTasks";
import { CreateTask } from "../task/CreateTask";
import { useDispatch, useSelector } from "react-redux";
import { selectAccount } from "../../redux/slicers/accountSlice";
import { UserRole } from "../../types/user";
import { CreateUserPage } from "../user/CreateUser";

const { Header, Content, Footer, Sider } = Layout;

export const MainMenu: React.FC = () => {
	const dispatch = useDispatch();
	const accState = useSelector(selectAccount);
	const [state, setState] = useState({
		collapsed: false,
	});

	const onCollapse = (collapsed: any) => {
		console.log(collapsed);
		setState({ collapsed });
	};

	const headerStyle: React.CSSProperties = {
		padding: 0,
		textAlign: "right",
	};

	const onMyTaskClick = () => {};

	return (
		<Layout style={{ minHeight: "100vh" }}>
			<Sider collapsed={state.collapsed} onCollapse={onCollapse}>
				<div className={styles.logoBox}>
					<div id="textLogoBox">
						{!state.collapsed ? "ZSU Roadmap" : "ZSU RM"}
					</div>
				</div>
				<Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
					<Menu.Item
						key="1"
						icon={<PieChartOutlined />}
						onClick={onMyTaskClick}
					>
						<NavLink to="/menu/mytasks">Мої задачі</NavLink>
					</Menu.Item>
					<Menu.Item key="6" icon={<PlusCircleOutlined />}>
						<NavLink to="/menu/createtask">Створити задачу</NavLink>
					</Menu.Item>
					{accState.role === UserRole.ADMIN && (
						<Menu.Item key="7" icon={<PlusCircleOutlined />}>
							<NavLink to="/menu/createuser">Створити користувача</NavLink>
						</Menu.Item>
					)}
					<Menu.Item key="8" icon={<GroupOutlined />}>
						Задачі підлеглих
					</Menu.Item>
				</Menu>
			</Sider>
			<Layout className="site-layout">
				<Header className="site-layout-background" style={{ padding: 0 }}>
					<Menu
						theme="dark"
						mode="horizontal"
						defaultSelectedKeys={["1"]}
						style={headerStyle}
					>
						<Menu.Item key="1">
							<UserMenu name={accState.login}></UserMenu>
						</Menu.Item>
					</Menu>
				</Header>
				<Content style={{ margin: "0 16px" }}>
					<div
						className="site-layout-background"
						style={{ width: "100%", height: "100%" }}
					>
						<Switch>
							<Route path="/menu/mytasks" component={MyTasks}></Route>
							<Route path="/menu/createuser" component={CreateUserPage}></Route>
							<Route path="/user"></Route>
							<Route path="/menu/createtask">
								<CreateTask />
							</Route>
						</Switch>
					</div>
				</Content>
				<Footer style={{ textAlign: "center" }}>
					ZSU Roadmap ©2020 Created by BIUS
				</Footer>
			</Layout>
		</Layout>
	);
};
