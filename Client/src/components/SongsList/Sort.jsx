import React, { useState } from "react";
import { Select } from "antd";
const Sort = ({ setSort }) => {
  const handleChange = (value) => {
    console.log(`selected ${value}`);
    setSort(value);
  };

  const buttonStyle = {
    background: "none",
    border: "none",
    paddingLeft: "10px",
    cursor: "pointer",
    boxShadow: "none",
    outline: "none",
    width: "30%",
  };

  return (
    <>
      <span style={{ marginLeft: "0.5rem" }}>Sort by</span>

      <Select
        defaultValue="none"
        onChange={handleChange}
        options={[
          {
            value: "name",
            label: "song-name",
          },
          {
            value: "artists",
            label: "artist",
          },
          {
            value: "rate",
            label: "beat rate",
          },
          {
            value: "popular",
            label: "most popular",
          },
          {
            value: "year",
            label: "newest",
          },
          
        ]}
        style={{ paddingLeft: "10px", width: "35%", textAlign: "center"}}
      />
    </>
  );
};
export default Sort;
