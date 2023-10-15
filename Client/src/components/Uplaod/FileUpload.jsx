import axios from "axios";
import { InboxOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Radio,
  Rate,
  Space,
  Upload,
  Input,
  Alert,
  Spin,
  Divider,
} from "antd";


import ImgCrop from "antd-img-crop";
import { React, useState } from "react";
import { useForm } from "antd/lib/form/Form";
import { message, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
const { TextArea } = Input;

// our url for http request
const baseURL = "http://localhost:3000/mp3";

const FileUpload = () => {
  const { Title } = Typography;
  const [cookies, setCookie, removeCookie] = useCookies(["access_token"]);
  const [songname, setSongname] = useState("");
  const [rate, setRate] = useState(0.2);
  const [description, setDescription] = useState("");
  const [permission, setPermission] = useState(false);
  const [singername, setSingername] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [form] = useForm();
  const [loading, setLoading] = useState(false);

  const [metadata, setMetadata] = useState({});

  const [fileList, setFileList] = useState([
    // {
    //   uid: "-1",
    //   name: "defualt.png",
    //   status: "done",
    //   url: musicplay,
    // },
  ]);
  const navigate = useNavigate();

  // design
  const formItemLayout = {
    labelCol: {
      span: 60,
    },
    wrapperCol: {
      span: 1000,
    },
  };

  const props = {
    name: "file",
    multiple: false,
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  //handles the upload event
  const normFile = (e) => {
    // if (e.dragger || e.dragger.length > 0) return;
    setSongname(e.file.name);
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  // Prevent file from being uploaded
  const handleBeforeUpload = (file) => {
    return false;
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const values = await form.getFieldsValue();
      const { dragger } = values;
      // in case no file is selected
      if (!dragger || dragger.length === 0) {
        message.error("Please select a file to upload.");
        return;
      }
      handleFileUpload(dragger[0].originFileObj, fileList[0].originFileObj);
    } catch (error) {
      console.error(error);
      message.error("Please fill in all the required fields.");
    }
  };

  const handleFileUpload = async (file, image) => {
    setLoading(true);
    if (!file) {
      // Handle case when no file is selected
      message.error("Please select a song to upload.");
      return;
    } else if (!image) {
      message.error("Please select a image to upload.");
      return;
    }

    const formData = new FormData();
    
    formData.append("file", file);
    formData.append("image", image);
    formData.append("song_details[rate]", rate);
    formData.append("song_details[song_name]", songname);
    formData.append("song_details[permission]", permission);
    formData.append("song_details[description]", description);
    formData.append("song_details[singer]", singername);

    const values = form.getFieldsValue();
    const accessToken = cookies.access_token || "aaa";
    console.log("Access Token:", accessToken);
    axios
      .post(`${baseURL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-rapidapi-host": "file-upload8.p.rapidapi.com",
          "x-rapidapi-key": "your-rapidapi-key-here",
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        console.log(response);
        resetFormFunction();
        message.success("File uploaded successfully!"); // Display success message
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          message.error("unAuthorized. Navigate to login");
          if (error.response.status === 401) {
            navigate("/login", { state: values });
          }
        } else {
          message.error("Failed to upload files. Please try again later.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onChange = ({ fileList: newFileList }) => {
    // Check if a new file is added
    if (newFileList.length > fileList.length) {
      // Get the latest file added
      const newFile = newFileList[newFileList.length - 1];
      // Remove the previous files from the file list
      setFileList([newFile]);
    } else {
      // Update the file list normally
      setFileList(newFileList);
    }
  };

  const onPreview = async (file) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const customRequest = async (options) => {
    const { onSuccess, onError, file, onProgress } = options;
    // Perform your custom upload logic here
    try {
      // Start the upload and monitor progress
      const response = await uploadFile(onProgress);
      onSuccess(response.data);
    } catch (error) {
      onError(error);
    }
  };

  const uploadFile = async (onProgress) => {
    const response = (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgress({ percent: percentCompleted });
    };
    return response;
  };

  const resetFormFunction = () => {
    setDescription("");
    setPermission(false);
    setRate(0.2);
    setSingername();
    setSongname();
    setFileList([]);
    form.resetFields();
  };

  const customDividerStyle = {
    height: "10px", // Adjust the height to make it bigger
    border: "none", // Remove the default border
    fontSize: "24px", // Adjust the font size to make it bigger
    marginBottom: "60px",
    marginTop: "40px",
  };
  return (
    <>
      <br></br>
      <div
        style={{
          width: "80%",
          margin: "auto",
        }}
      >
        <Divider style={customDividerStyle}>Upload</Divider>
      </div>

      <div>
        {errorMessage && (
          <Alert message="Error" type="error" showIcon closable />
        )}
      </div>
      <Spin spinning={loading} tip="Loading" size="large">
        <Form
          name="upload_form"
          form={form}
          {...formItemLayout}
          // onFinish={({ dragger }) =>
          //   handleFileUpload(dragger[0].originFileObj, fileList[0].originFileObj)
          // }
          onFinish={handleSubmit}
          initialValues={{
            rate: rate,
            songname: songname,
          }}
          style={{
            maxWidth: 1000,
            margin: "auto",
          }}
        >
          <Form.Item label="Dragger">
            <Form.Item
              name="dragger"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              noStyle
            >
              <Upload.Dragger
                {...props}
                accept=".mp3"
                beforeUpload={handleBeforeUpload}
                name="files"
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Support for a single or bulk upload.
                </p>
              </Upload.Dragger>
            </Form.Item>
          </Form.Item>

          <Form.Item
            label="Song name"
            name="songname"
            rules={[
              {
                // required: true,
                message: "Please input name of song!",
              },
            ]}
          >
            <Input
              value={songname}
              onChange={(e) => setSongname(e.target.value)}
            />
            <br />
          </Form.Item>

          <Form.Item
            label="Singer name"
            name="singername"
            rules={[
              {
                // required: true,
                message: "Please input name of singer!",
              },
            ]}
          >
            <Input
              value={singername}
              onChange={(e) => setSingername(e.target.value)}
            />
            <br />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              {
                message: "Please input description!",
              },
            ]}
          >
            <TextArea
              defaultValue={description}
              showCount
              maxLength={400}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Item>
          <Form.Item name="permission" label="choose permission">
            <Radio.Group>
              <Radio
                value="false"
                onChange={(e) => setPermission(e.target.value)}
              >
                private
              </Radio>
              <Radio
                value="true"
                onChange={(e) => setPermission(e.target.value)}
              >
                public
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="rate" label="Rate">
            <Rate value={rate} onChange={(value) => setRate(value)} />
          </Form.Item>

          <ImgCrop rotationSlider>
            <Upload
              name="image"
              listType="picture-card"
              fileList={fileList}
              onChange={onChange}
              onPreview={onPreview}
              customRequest={customRequest}
            >
              {fileList.length < 5 && "+ Upload"}
            </Upload>
          </ImgCrop>

          <Form.Item
            wrapperCol={{
              span: 12,
              offset: 6,
            }}
          >
            <Space>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
              <Button htmlType="reset" onClick={resetFormFunction}>
                reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Spin>
    </>
  );
};

export default FileUpload;
