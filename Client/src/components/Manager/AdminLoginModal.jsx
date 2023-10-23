import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Input } from "antd";
import { createStyles, useTheme } from "antd-style";
import axios from "axios";
import { useCookies } from "react-cookie";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate, Link, useLocation } from "react-router-dom";

// npm i antd-style
const baseURL = "http://localhost:3000";
const useStyle = createStyles(({ token }) => ({
  "my-modal-body": {
    background: token["blue-1"],
    padding: token.paddingSM,
  },
  "my-modal-mask": {
    boxShadow: `inset 0 0 15px #fff`,
  },
  "my-modal-header": {
    borderBottom: `1px dotted ${token.colorPrimary}`,
  },
  "my-modal-footer": {
    color: token.colorPrimary,
  },
  "my-modal-content": {
    border: "1px solid #333",
  },
}));
const AdminLoginModal = ({ isAdminLoggedIn, setIsAdminLoggedIn }) => {
  useEffect(() => {
    toggleModal(0, true);
  }, []);
  const [isModalOpen, setIsModalOpen] = useState([false, false]);
  const { styles } = useStyle();
  const [cookies, setCookie] = useCookies(["access_token", "id"]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const token = useTheme();
  const toggleModal = (idx, target) => {
    // אם רוצה לעשות איקס אבל הוא לא בפנים - אם לא מתקיים מצב זה
    if (!(idx === 0 && target == false && !isAdminLoggedIn)) {
      setIsModalOpen((p) => {
        p[idx] = target;
        return [...p];
      });
    }
  };
  const classNames = {
    body: styles["my-modal-body"],
    mask: styles["my-modal-mask"],
    // header: styles["my-modal-header"],
    footer: styles["my-modal-footer"],
    content: styles["my-modal-content"],
  };
  const modalStyles = {
    header: {
      // borderLeft: `5px solid ${token.colorPrimary}`,
      borderRadius: 0,
      paddingInlineStart: 5,
    },
    body: {
      boxShadow: "inset 0 0 5px #999",
      borderRadius: 5,
    },
    mask: {
      backdropFilter: "blur(10px)",
    },
    footer: {
      borderTop: "1px solid #333",
    },
    content: {
      boxShadow: "0 0 30px #999",
    },
  };

  // form actions
  const onFinish = (values) => {
    // console.log("Success:", values);
    axios
      .post(`${baseURL}/auth/adminlogin`, values)
      .then((response) => {
        if (cookies.access_token) {
          // Update the existing cookie value
          setCookie("access_token", response.data.access_token, { path: "/" });
          setCookie("id", response.data.id, { path: "/" });
        } else {
          setCookie("access_token", response.data.access_token, { path: "/" });
          setCookie("id", response.data.id, { path: "/" });
        }
        setIsAdminLoggedIn(true);
        toggleModal(0, false);
        // navigate('admin1');
      })
      .catch((error) => {
        console.log("in catch");
        console.error("can't get in 👿👿", error);
        setIsAdminLoggedIn(false);
      })
      .finally(() => {
        console.log("in final");

        form.resetFields();
      });
    // const { email, password } = values;

    // axios
    //   .post(`${baseURL}/auth/adminlogin`, { email, password })
    //   .then((response) => {
    //     console.log("in response");
    //     console.log(response.data);
    //   })
    //   .catch((error) => {
    //     console.log("in catch", error);
    //   })
    //   .finally(() => {
    //     console.log("in finally");
    //   });
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  return (
    <>
      <Modal
        title="Administrator Login"
        open={isModalOpen[0]}
        onOk={() => toggleModal(0, false)}
        onCancel={() => toggleModal(0, false)}
        footer="Note: Too many tryings will block the login"
        classNames={classNames}
        styles={modalStyles}
      >
        <Form
          form={form}
          name="basic"
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          style={{
            maxWidth: 600,
          }}
          initialValues={{}}
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
            {/* <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" /> */}
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
            {/* <Input
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="Password"
        /> */}
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
          >
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
export default AdminLoginModal;
