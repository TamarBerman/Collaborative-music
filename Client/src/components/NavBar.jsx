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
import { useContext } from "react";
import React from "react";
import { userContext } from "../contexts/userContext";
import axios from "axios";
const baseURL = "http://localhost:3000";
import { playlistsContext } from "../contexts/playlistsContext";

const NavBar = ({ children }) => {
  const [cookies, setCookie, removeCookie] = useCookies(["access_token"]);
  const [current, setCurrent] = useState("mail");
  const isLoggedIn = !!cookies.access_token; // Check if access_token exists
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState("Guest");

  const [userPlaylist, setUserPlaylist] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  useEffect(() => {
    console.log("i am in navbar!!!!!!!!!!");
    //
    axios
      .get(`${baseURL}/auth/getuser`, {
        headers: {
          Authorization: `Bearer ${cookies.access_token}`,
        },
      })
      .then((response) => {
        setCurrentUser(response.data.name);
      })
      .catch((error) => {
        setCurrentUser("Guest");
      });
  }, []);

  useEffect(() => {
    axios
      .get(`${baseURL}/mp3/getUserPlaylists`, {
        headers: {
          Authorization: `Bearer ${cookies.access_token}`,
        },
      })
      .then((response) => {
        // הוספת שם הרשימה לתפריט
        const userPlaylistItem = [];
        let i = 0;
        response.data.forEach((item) => {
          userPlaylistItem.push(getItem(++i, item));
        });
        userPlaylistItem.push(
          getItem(++i, { playlistId: 0, name: "New Playlist" })
        );
        setUserPlaylist(userPlaylistItem);
        setNewPlaylistName(`playList_${userPlaylistItem.length}`);
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          removeCookie("access_token");
        }
      });

    // PlayList menu
    // // יוצר אובייקטים להוספת רשימת הפלייליסטים לתפריט
    const getItem = (key, { playlistId, name }) => {
      const label = name;
      return {
        key,
        playlistId,
        label,
      };
    };
  }, [userPlaylist, setUserPlaylist, cookies.access_token, removeCookie]);

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
    <Menu onClick={handleUserMenuClick} style={{ margin: 20 }}>
      {isLoggedIn && (
        <Menu.Item
          key="profile"
          icon={<UserOutlined />}
          onClick={handleProfileClick}
          style={{ padding: 10 }}
        >
          My Profile
        </Menu.Item>
      )}

      {isLoggedIn && ( // Conditionally render the Logout menu item
        <Menu.Item
          key="logout"
          icon={<LogoutOutlined />}
          onClick={handleLogoutClick}
          style={{ padding: 10 }}
        >
          Logout
        </Menu.Item>
      )}
      {!isLoggedIn && ( // Conditionally render the Logout menu item
        <Menu.Item
          key="connect"
          icon={<LoginOutlined />}
          onClick={handleConnectClick}
          style={{ fontSize: "20px" }}
        >
          Connect
        </Menu.Item>
      )}
    </Menu>
  );
  return (
    <>
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
            style={{ marginRight: "auto", fontSize: "25px" }}
          >
            <Link to={"/"}>Home</Link>
          </Menu.Item>

          <Menu.Item
            key="music"
            icon={<PlayCircleOutlined />}
            style={{ fontSize: "20px" }}
          >
            <Link to={"/music"}>Music</Link>
          </Menu.Item>

          <Menu.Item
            key="playlist"
            icon={<CustomerServiceOutlined />}
            style={{ fontSize: "20px" }}
          >
            <Link to={"/playlist"}>Playlist</Link>
          </Menu.Item>

          <Menu.Item
            key="upload"
            icon={<UploadOutlined />}
            style={{ fontSize: "20px" }}
          >
            <Link to={"/upload"}>Upload</Link>
          </Menu.Item>

          <Menu.Item
            key="about"
            icon={<AliwangwangOutlined />}
            style={{ fontSize: "20px" }}
          >
            <Link to={"/about"}>About</Link>
          </Menu.Item>

          {/* <Menu.Item
            key="login"
            style={{
              marginLeft: "auto",
              fontSize: "20px",
            }}
          >
            <Link to={"/login"}>Login</Link>
          </Menu.Item> */}
          <Menu.Item
            key="login"
            style={{
              marginLeft: "auto",
              fontSize: "20px",
            }}
          >
            <Link to="/login">
              <Button
                type="text"
                style={{
                  borderRadius: "20px", // Adjust the value as needed
                  padding: "7px 20px", // Adjust padding as needed
                  border: "1px solid #fff", // Border styles
                  display: "flex",
                  alignItems: "center", // Center vertically within the button
                  justifyContent: "center", // Center horizontally within the button
                  // marginBottom: "9px",
                }}
                className="custom-button"
              >
                Login
              </Button>
            </Link>
          </Menu.Item>

          <Menu.Item key="register" style={{ fontSize: "20px" }}>
            <Link to={"/register"}>
              <Button
                type="text"
                style={{
                  borderRadius: "20px", // Adjust the value as needed
                  padding: "7px 20px", // Adjust padding as needed
                  border: "1px solid #fff", // Border styles
                  display: "flex",
                  alignItems: "center", // Center vertically within the button
                  justifyContent: "center", // Center horizontally within the button
                  // marginBottom: "9px",
                }}
                className="custom-button"
              >
                Register
              </Button>
            </Link>
          </Menu.Item>

          <Menu.Item
            key="user-menu"
            style={{ marginLeft: "0.5rem", fontSize: "20px" }}
          >
            <span>{currentUser}</span>
            {/* <p>Hi {userName}</p> */}
            <Dropdown overlay={userMenu} trigger={["hover"]}>
              <Button
                type="text"
                icon={
                  <Avatar
                    style={{
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    icon={
                      <UserOutlined
                        style={{
                          fontWeight: "bold",
                          fontSize: "20px",
                        }}
                      />
                    }
                  />
                }
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
      {/* contexts */}

      <userContext.Provider value={{ currentUser, setCurrentUser }}>
        <playlistsContext.Provider value={{userPlaylist, setUserPlaylist,newPlaylistName, setNewPlaylistName }}>
        {children}
        </playlistsContext.Provider>
      </userContext.Provider>
    </>
  );
};

export default NavBar;
