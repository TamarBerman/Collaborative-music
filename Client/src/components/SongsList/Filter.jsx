import React, { useState } from "react";
import {
  Checkbox,
  DatePicker,
  Select,
  Form,
  Divider,
  Button,
  Row,
  Col,
} from "antd";
import {
  UpOutlined,
  DownOutlined,
  FilterOutlined,
  CloseOutlined,
} from "@ant-design/icons";
const { RangePicker } = DatePicker;
const { Group: CheckboxGroup } = Checkbox;
const { Option } = Select;
const baseUrl = "http://localhost:3000/mp3";

import axios from "axios";

const Filter = (props) => {
  const dateFormatList = ["DD/MM/YYYY", "DD/MM/YY"];
  const [showMoreInputs, setShowMoreInputs] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const { dateRange, select, checkbox, ...restValues } = values;
      // const [beginDate, endDate] = dateRange;
      // // Format the begin and end dates as needed
      // const formattedBeginDate = beginDate.format("YYYY-MM-DD");
      // const formattedEndDate = endDate.format("YYYY-MM-DD");
      let formattedBeginDate = "";
      let formattedEndDate = "";

      if (dateRange) {
        const [beginDate, endDate] = dateRange;
        formattedBeginDate = beginDate ? beginDate.format("YYYY-MM-DD") : "";
        formattedEndDate = endDate ? endDate.format("YYYY-MM-DD") : "";
      }
      console.log(formattedBeginDate, formattedEndDate);

      props.setFilteredData({
        select: select,
        checkbox: checkbox,
        beginDate: formattedBeginDate,
        endDate: formattedEndDate,
      });
    // setShowMoreInputs(!showMoreInputs);
    });
  };
  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };

  const handleToggleInputs = () => {
    setShowMoreInputs(!showMoreInputs);
  };

  const buttonStyle = {
    background: "none",
    border: "none",
    padding: "10px",
    cursor: "pointer",
    boxShadow: "none",
    outline: "none",
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        style={{ width: "100%", margin: "auto", marginTop: "20px" , marginBottom:"10px"}}
        initialValues={{ dateRange: [null, null] }}
      >
        <Row gutter={[8, 8]} align="middle">
          <Col xs={24} sm={12} md={24} align="left">
            <Form.Item>
              <Button style={buttonStyle} onClick={handleToggleInputs}>
                {/* {showMoreInputs ? <DownOutlined /> : <UpOutlined />} */}
                {showMoreInputs ? (
                  <>
                    <CloseOutlined style={{ fontSize: '18px' }}/>
                  </>
                ) : (
                  <>
                    {" "}
                    <FilterOutlined style={{ fontSize: '17px' }}/>{" "}
                    <span style={{ marginLeft: "0.5rem" ,fontSize: '17px' }}>Filter</span>
                  </>
                )}
              </Button>
            </Form.Item>
          </Col>
          {showMoreInputs && (
            <>
              
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="select">
                  <Select
                    defaultValue="abcSong"
                    onChange={handleChange}
                    options={[
                      {
                        value: "name",
                        label: "abc song-name",
                      },
                      {
                        value: "singerName",
                        label: "abc singer-name",
                      },
                      {
                        value: "rate",
                        label: "beat rate",
                      },
                      {
                        value: "popular",
                        label: "most popular",
                        disabled: true,
                      },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={7}>
                <Form.Item name="dateRange">
                  <RangePicker />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="checkbox">
                  <CheckboxGroup
                    options={["1⭐", "2⭐", "3⭐", "4⭐", "5⭐"]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={3}>
                <Form.Item name="button">
                  <Button type="primary" onClick={handleSubmit}>
                    Filter
                  </Button>
                </Form.Item>
              </Col>
            </>
          )}
        </Row>
      </Form>
    </>
  );
};

export default Filter;
