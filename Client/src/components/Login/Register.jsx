import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Row,
  Typography,
  message,
  Divider,
} from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import ReCAPTCHA from "react-google-recaptcha";
import { useState, useEffect } from "react";

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 16, offset: 8 },
  },
};
const Register = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["access_token", "id"]);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const baseURL = "http://localhost:3000";

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const onFinish = (values) => {
    if (!values.captcha) {
      message.warning("Please complete the captcha.");
      return;
    }
    console.log("Received values of form: ", values);
    axios
      .post(`${baseURL}/auth/register`, values)
      .then((response) => {
        console.log(response.data);
        if (cookies.access_token) {
          // Update the existing cookie value
          setCookie("access_token", response.data.access_token, { path: "/" });
          setCookie("access_token", response.data.id, { path: "/" });
        } else {
          setCookie("access_token", response.data.access_token, { path: "/" });
          setCookie("id", response.data.id, { path: "/" });
        }
        message.success("welcome " + values.name);
        navigate("/home");
      })
      .catch((error) => {
        message.warning("you have an account already, please login");
        navigate("/login");
      })
      .finally(() => {
        form.resetFields();
      });
  };

  const { Title } = Typography;
  const customDividerStyle = {
    height: "10px", // Adjust the height to make it bigger
    backgroundColor: "#000", // Change the color to your preference
    border: "none", // Remove the default border
    fontSize: "24px", // Adjust the font size to make it bigger
    marginBottom: "60px",
    marginTop: "40px",
  };

  return (
    <div
      style={{
        width: "60%",
        margin: "auto",
      }}
    >
      {/* <Title>Register</Title> */}
      <br />
      <Divider style={customDividerStyle}>Register</Divider>

      <Form
        {...formItemLayout}
        form={form}
        name="register"
        onFinish={onFinish}
        initialValues={{
          residence: ["zhejiang", "hangzhou", "xihu"],
          prefix: "86",
        }}
        style={{
          maxWidth: windowWidth >= 600 ? 600 : "90%", // Adjust the width based on screen size
          margin: "auto",
        }}
        scrollToFirstError
      >
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
          name="password"
          label="Password"
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="confirm"
          label="Password 2"
          dependencies={["password"]}
          hasFeedback
          rules={[
            {
              required: true,
              message: "Please confirm your password!",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The two passwords that you entered do not match!")
                );
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="name"
          label="Nickname"
          tooltip="What do you want others to call you?"
          rules={[
            {
              required: true,
              message: "Please input your nickname!",
              whitespace: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Captcha"
          extra="We must make sure that your are a human."
        >
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item
                name="captcha"
                noStyle
                rules={[
                  {
                    required: true,
                    message: "Please input the captcha you got!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Button>Get captcha</Button>
              {/* <ReCAPTCHA
                sitekey="YOUR_RECAPTCHA_SITE_KEY"
                onChange={(value) => form.setFieldsValue({ captcha: value })}
              /> */}
            </Col>
          </Row>
        </Form.Item>

        <Form.Item
          name="agreement"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value
                  ? Promise.resolve()
                  : Promise.reject(new Error("Should accept agreement")),
            },
          ]}
          {...tailFormItemLayout}
        >
          <Checkbox>
            I have read the <a href="">agreement</a>
          </Checkbox>
        </Form.Item>
        <Form.Item {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit">
            Register
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
export default Register;

// npm install react-google-recaptcha
