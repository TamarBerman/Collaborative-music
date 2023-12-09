import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { HighlightOutlined } from "@ant-design/icons";
import { Typography, message, Button, Space } from "antd";
const { Paragraph ,Text } = Typography;
const { Title } = Typography;
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../contexts/userContext";

const baseUrl = "http://localhost:3000";

const Profile = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState("");
  const [cookies, setCookie, removeCookie] = useCookies(["access_token", "id"]);
  const accessToken = cookies.access_token || null;
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(userContext);

  useEffect(() => {
    axios
      .get(`${baseUrl}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        const currentUser = response.data;
        console.log(currentUser);
        setUserId(currentUser._id);
        setUserName(currentUser.name);
        setEmail(currentUser.email);
        setPassword(currentUser.password);

      })
      .catch((error) => {
        console.error(error);
        message.error("Could not get current user's details");
      });
  }, []);

  const editProfile = () => {
    const newUser = {
      username: userName,
      email: email,
      password: password,
    };
    axios
      .put(
        `${baseUrl}/auth/editprofile`,
        { newUser:newUser, userId:userId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then((response) => {
        message.success(userName + ", \nyour profile edited successfuly");
        setCurrentUser(response.data.name)
        navigate('/home')
      })
      .catch((error) => {
        console.error(error);
        message.error("Could not edit user");
      });
  };

  return (
    <>
      <Title>Profile</Title>

      <div
        style={{
          width: "50%",
          margin: "auto",
          marginTop: "100px",
          border: "0.2px solid #ddd", // Adding a border to the container
          borderRadius: "10px",
          padding: "50px", // Adding padding to the container for better spacing
        }}
      >
        {/* Editable username */}
        {/* <Space
          align="center"
          style={{
            width: "100%",
            justifyContent: "space-between",
            fontSize: "18px",
          }}
        >
          <Text strong>Username:</Text> */}
        <Paragraph
          editable={{
            icon: <HighlightOutlined />,
            tooltip: "click to edit text",
            onChange: setUserName,
            enterIcon: null,

          }}
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "18px",
          }}
        >
          {userName}
        </Paragraph>
{/* </Space> */}
        {/* Editable email */}
        <Paragraph
          editable={{
            icon: <HighlightOutlined />,
            tooltip: "click to edit text",
            onChange: setEmail,
            enterIcon: null,
          }}
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "18px",
          }}
        >
          {email}
        </Paragraph>

        {/* Editable password */}
        <Paragraph
          editable={{
            icon: <HighlightOutlined />,
            tooltip: "click to edit text",
            onChange: setPassword,
            enterIcon: null,
          }}
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "18px",
          }}
        >
          {password}
        </Paragraph>
        <Button
          type="primary"
          htmlType="submit"
          className="login-form-button"
          onClick={editProfile}
        >
          Edit{" "}
        </Button>
      </div>
    </>
  );
};
export default Profile;
