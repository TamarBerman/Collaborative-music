import React, { useState, useEffect } from "react";
import { Button, Modal } from "antd";
import Login from "./Login";
import { useNavigate } from "react-router-dom";

const NavigateToLogin = () => {
  const navigate = useNavigate();

  const [modal2Open, setModal2Open] = useState(false);
  useEffect(() => {
    setModal2Open(true);
  }, []);

  const modalStyles = {
    mask: {
      backdropFilter: "blur(0.5px)",
    },
    content: {
      boxShadow: "0 0 10px #999",
    },
  };
  const cancel=()=>{
    setModal2Open(false)
    navigate(-1);
  }
  return (
    <>
      <Modal
        title="To access upload you have to LOGIN"
        centered
        open={modal2Open}
        // onOk={() => setModal2Open(false)}
        onCancel={cancel}
        width={700}
        styles={modalStyles}
        footer={null}
      >
        <Login />
      </Modal>
    </>
  );
};

export default NavigateToLogin;
