// Components/NavBar.js
import { Link } from "react-router-dom";
import {
  TeamOutlined,
  HomeOutlined,
  CustomerServiceOutlined,
  UploadOutlined,
  LoginOutlined,
  PlayCircleOutlined,
  UserOutlined,
  ProfileOutlined,
  LogoutOutlined,
  AliwangwangOutlined,
} from "@ant-design/icons";
import { Menu, Affix, Button, Avatar, Dropdown, message } from "antd";
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const items = [
  {
    label: <Link to={"/"}>Home</Link> && <Link to={"/home"}>Home</Link>,
    key: "home",
    icon: <HomeOutlined />,
  },
  {
    label: <Link to={"/music"}> Music</Link>,
    key: "music",
    icon: <PlayCircleOutlined />,
  },
  {
    label: <Link to={"/playlist"}>Playlist</Link>,
    key: "playlist",
    icon: <CustomerServiceOutlined />,
  },
  {
    label: <Link to={"/about"}> About</Link>,
    key: "about",
    icon: <AliwangwangOutlined />,
  },
  {
    label: <Link to={"/uplaod"}> Uplaod</Link>,
    key: "uplaod",
    icon: <UploadOutlined />,
  },
  {
    label: <Link to={"/login"}>Login</Link>,
    key: "login",
    icon: <LoginOutlined />,
  },
  {
    label: <Link to={"/register"}>Register</Link>,
    key: "register",
    icon: <TeamOutlined />,
  },
];
const NavBar = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["access_token"]);
  const [current, setCurrent] = useState("mail");
  const isLoggedIn = !!cookies.access_token; // Check if access_token exists
  const navigate = useNavigate();

  useEffect(() => {
    console.log(cookies.access_token);
  }, []);

  const onClick = (e) => {
    setCurrent(e.key);
  };
  const handleUserMenuClick = (e) => {};

  const handleLogoutClick = () => {
    console.log("renove");
    removeCookie("access_token", { path: "/" });
    removeCookie("id", { path: "/" });
    message.success("You are now logged out ");
    // render the page!!!! TODO:
  };
  const handleConnectClick = () => {
    navigate("/login");
  };
  const handleProfileClick = () => {
    navigate("/profile");
  };

  const userMenu = (
    <Menu onClick={handleUserMenuClick}>
      {isLoggedIn && (
        <Menu.Item
          key="profile"
          icon={<UserOutlined />}
          onClick={handleProfileClick}
          style={{ fontSize: "17px" }}
        >
          My Profile
        </Menu.Item>
      )}

      {isLoggedIn && ( // Conditionally render the Logout menu item
        <Menu.Item
          key="logout"
          icon={<LogoutOutlined />}
          onClick={handleLogoutClick}
          style={{ fontSize: "17px" }}
        >
          Logout
        </Menu.Item>
      )}
      {!isLoggedIn && ( // Conditionally render the Logout menu item
        <Menu.Item
          key="connect"
          icon={<LoginOutlined />}
          onClick={handleConnectClick}
          style={{ fontSize: "17px" }}
        >
          Connect
        </Menu.Item>
      )}
    </Menu>
  );
  return (
    <Affix>
      <Menu
        mode="horizontal"
        selectedKeys={[current]}
        onClick={onClick}
        style={{
          backgroundColor: "black",
          height: "170%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Menu.Item key="logo" style={{ marginRight: "auto", fontSize: "20px" }}>
          <Link to={"/"}>Home</Link>
        </Menu.Item>

        <Menu.Item
          key="music"
          icon={<PlayCircleOutlined />}
          style={{ fontSize: "17px" }}
        >
          <Link to={"/music"}>Music</Link>
        </Menu.Item>

        <Menu.Item
          key="playlist"
          icon={<CustomerServiceOutlined />}
          style={{ fontSize: "17px" }}
        >
          <Link to={"/playlist"}>Playlist</Link>
        </Menu.Item>

        <Menu.Item
          key="upload"
          icon={<UploadOutlined />}
          style={{ fontSize: "17px" }}
        >
          <Link to={"/upload"}>Upload</Link>
        </Menu.Item>

        <Menu.Item
          key="about"
          icon={<AliwangwangOutlined />}
          style={{ fontSize: "17px" }}
        >
          <Link to={"/about"}>About</Link>
        </Menu.Item>

        <Menu.Item
          key="login"
          style={{
            marginLeft: "auto",
            fontSize: "17px",
          }}
        >
          <Link to={"/login"}>Login</Link>
        </Menu.Item>

        <Menu.Item key="register" style={{ fontSize: "17px" }}>
          <Link to={"/register"}>Register</Link>
        </Menu.Item>

        <Menu.Item
          key="user-menu"
          style={{ marginLeft: "0.5rem", fontSize: "17px" }}
        >
          <Dropdown overlay={userMenu} trigger={["hover"]}>
            <Button
              type="text"
              icon={<Avatar icon={<UserOutlined />} />}
              style={{
                background: "none",
                border: "none",
                textDecoration: "none !important",
              }}
            />
          </Dropdown>
        </Menu.Item>
      </Menu>
    </Affix>
  );
};

export default NavBar;
