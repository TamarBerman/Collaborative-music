import {
  Button,
  Checkbox,
  Form,
  Input,
  Typography,
  message,
  Divider,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import "../../index.css";
import "../../antd-custom.css"; // Import your custom styles
import NavBar from "../NavBar";
import React, { useContext } from "react";
import { userContext } from "../../contexts/userContext";

export default function Login() {
  const [cookies, setCookie] = useCookies(["access_token", "id"]);
  const [form] = Form.useForm();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  const { state } = useLocation();
  const baseURL = "http://localhost:3000";

  // שימוש בקונטקסט
  const { setCurrentUser } = useContext(userContext);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  //when login pressed
  const onFinish = (values) => {
    const { email, password } = values;
    axios
      .post(`${baseURL}/auth/login`, { email, password })
      .then((response) => {
        //200
        console.log(response.data);
        console.log(response.data?.user?.name);
        if (cookies.access_token) {
          console.log("tr");
          // Update the existing cookie value
          setCookie("access_token", response.data.access_token, { path: "/" });
          setCookie("id", response.data.id, { path: "/" });
        } else {
          console.log("fl");
          setCookie("access_token", response.data.access_token, { path: "/" });
          setCookie("id", response.data.id, { path: "/" });
        }
        message.success(response.data.user.name + " Logged in successfully");
        // עדכון קונטקסט
        setCurrentUser(response.data.user.name);
        // if (state == null) navigate("/home");
        navigate(-1);
      })
      .catch(function (error) {
        console.log(error.response.status, "Error");
        if (error.response && error.response.status == 404) {
          message.error("user does not exist");
          navigate("/register");
        } else if (error.response && error.response.status == 401) {
          message.warning("Invalid username or password");
        }
      })
      .finally(function () {
        form.resetFields();
      });
  };

  // on Finish Failed
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const customDividerStyle = {
    height: "10px", // Adjust the height to make it bigger
    backgroundColor: "#000", // Change the color to your preference
    border: "none", // Remove the default border
    fontSize: "24px", // Adjust the font size to make it bigger
    marginBottom: "60px",
    marginTop: "40px",
  };
  const { Title } = Typography;
  return (
    <div
      style={{
        width: "60%",
        margin: "auto",
      }}
    >
      {/* <Title>Login</Title> */}
      <br />
      <Divider style={customDividerStyle}>Login</Divider>
      <Form
        style={{
          maxWidth: windowWidth >= 600 ? 600 : "90%", // Adjust the width based on screen size
          margin: "auto",
        }}
        form={form}
        name="basic"
        labelCol={{
          span: 5,
        }}
        wrapperCol={{
          span: 16,
        }}
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[
            {
              required: true,
              message: "Please input your username!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="E-mail"
          rules={[
            {
              type: "email",
              message: "The input is not valid E-mail!",
            },
            {
              required: true,
              message: "Please input your E-mail!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="remember"
          valuePropName="checked"
          wrapperCol={{
            offset: 4,
            span: 16,
          }}
        >
          <Checkbox>Remember me </Checkbox>
          <a className="login-form-forgot" href="">
            Forgot password
          </a>
        </Form.Item>

        <Form.Item
          wrapperCol={{
            offset: 4,
            span: 16,
          }}
        >
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            Log in
          </Button>
          {(e) => onFinish(e)}
          <br />
          Don&apos;t have a account yet?{" "}
          <Link to="/register">register now!</Link>
        </Form.Item>
      </Form>
    </div>
  );
}
