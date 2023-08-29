// components/PageHeader.jsx
import React from "react";
import { Divider } from "antd";
import { useLocation } from "react-router-dom"; // Import useLocation hook

const PageHeader = () => {
  const location = useLocation();
  const currentComponentName = location.pathname.split("/")[1]; // Extract the component name from the route path

  const customDividerStyle = {
    height: "10px", // Adjust the height to make it bigger
    backgroundColor: "#000", // Change the color to your preference
    border: "none", // Remove the default border
    fontSize: "24px", // Adjust the font size to make it bigger
    marginBottom: "20px",
    marginTop: "40px"
  };
  return (
    <Divider style={customDividerStyle}>
      {currentComponentName}
    </Divider>
  );
};

export default PageHeader;
