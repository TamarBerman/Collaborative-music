// Components/NavBar.js
import { Link } from "react-router-dom";
import { LoginOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { Menu, Affix, Button, Avatar, Dropdown, message } from "antd";
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HelloAdmin from "./Manager/HelloAdmin";
import AdminLogin from "./Manager/AdminPage";
import AdminLoginModal from "./Manager/AdminLoginModal";
const LogoImage = () => (
  <img src="src/assets/iHeart.png" style={{ height: "40px" }} />
);

const AdminLayout = ({ children }) => {
  const [cookies, setCookie, removeCookie] = useCookies(["access_token"]);
  const [current, setCurrent] = useState("mail");
  const isLoggedIn = !!cookies.access_token; // Check if access_token exists
  const navigate = useNavigate();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

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
    <>
      {!isAdminLoggedIn ? (
        <AdminLoginModal
          isAdminLoggedIn={isAdminLoggedIn}
          setIsAdminLoggedIn={setIsAdminLoggedIn}
        />
      ) : null}
      <HelloAdmin />

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
          <Menu.Item
            key="logo"
            style={{ marginRight: "auto", fontSize: "20px" }}
          >
            <Link to={"/"}>
              {" "}
              <LogoImage />
            </Link>
          </Menu.Item>

          <Menu.Item
            key="manageusers"
            // icon={<AliwangwangOutlined />}
            style={{ fontSize: "17px" }}
          >
            <Link to={"/admin1/manageusers"}>ManageUsers</Link>
          </Menu.Item>
          <Menu.Item
            key="managesongs"
            // icon={<AliwangwangOutlined />}
            style={{ fontSize: "17px" }}
          >
            <Link to={"/admin1/managesongs"}>ManageSongs</Link>
          </Menu.Item>

          <Menu.Item
            key="login"
            style={{
              marginLeft: "auto",
              fontSize: "17px",
            }}
          >
            {/* <Link to={"/login"}>Login</Link> */}
          </Menu.Item>

          <Menu.Item key="register">
            {/* style={{ fontSize: "17px" }} */}
            {/* <Link to={"/register"}>Register</Link> */}
          </Menu.Item>
        </Menu>
      </Affix>
      <br />
      {children}
    </>
  );
};

export default AdminLayout;
