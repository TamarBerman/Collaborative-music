import React, { useState } from "react";
import { Checkbox, DatePicker, Form, Button, Row, Col, Select } from "antd";
import {
  UpOutlined,
  DownOutlined,
  FilterOutlined,
  CloseOutlined,
} from "@ant-design/icons";
const { RangePicker } = DatePicker;
const { Group: CheckboxGroup } = Checkbox;

const Filter = (props) => {
  const [showMoreInputs, setShowMoreInputs] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const { dateRange, categorySelect, checkbox, ...restValues } = values;
      props.setFilteredData({
        checkbox: checkbox,
        dateRange: { begin: dateRange?dateRange[0]?.$y:null, end: dateRange?dateRange[1]?.$y:null },
        categorySelect: categorySelect,
      });
    });
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

  // multiple select category
  // multiple category select
  const options = [
    { label: "חתונה", value: "wedding" },
    { label: "שקט", value: "quiet" },
    { label: "סוער", value: "stormy" },
    { label: "חגים", value: "Holiday" },
    { label: "שמחה", value: "happy" },
    { label: "רגוע", value: "calm" },
    { label: "דיגיי", value: "dj" },
    { label: "אחר", value: "other" },
  ];
  const handleChangeCategory = (value) => {
    console.log(`selected ${value}`);
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        style={{
          width: "100%",
          margin: "auto",
          marginTop: "20px",
          marginBottom: "10px",
        }}
        initialValues={{ dateRange: [null, null] }}
      >
        <Row gutter={[8, 8]} align="middle">
          <Col span={4} xs={24} sm={12} md={24} align="left">
            <Form.Item>
              <Button style={buttonStyle} onClick={handleToggleInputs}>
                {/* {showMoreInputs ? <DownOutlined /> : <UpOutlined />} */}
                {showMoreInputs ? (
                  <>
                    <CloseOutlined />
                  </>
                ) : (
                  <>
                    {" "}
                    <FilterOutlined />{" "}
                    <span style={{ marginLeft: "0.5rem" }}>Filter</span>
                  </>
                )}
              </Button>
            </Form.Item>
          </Col>
          {showMoreInputs && (
            <>
              <Col span={10} xs={24} sm={12} md={7}>
                <Form.Item name="dateRange">
                  <RangePicker picker="year" placeholder={["Begin year", "End year"]} />
                </Form.Item>
              </Col>
              {/* <Col xs={24} sm={12} md={8}>
                <Form.Item name="checkbox">
                  <CheckboxGroup
                    options={["1⭐", "2⭐", "3⭐", "4⭐", "5⭐"]}
                  />
                </Form.Item>
              </Col> */}
              <Col  span={10} xs={24} sm={12} md={8}>
                <Form.Item name="categorySelect">
                  <Select
                    mode="multiple"
                    allowClear
                    style={{
                      width: "100%",
                    }}
                    placeholder="Please select"
                    // defaultValue={["other"]}
                    onChange={handleChangeCategory}
                    options={options}
                  />
                </Form.Item>
              </Col>
              <Col span={4} xs={24} sm={12} md={3}>
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
