import { useNavigate } from "react-router-dom";
import React from "react"
const Error404 = () => {
  const navigate = useNavigate();
  return (
    <>
      <h1>404 ERROR</h1>
      <button onClick={()=>navigate("/home")}>go to Home</button>
      <br />
      <button onClick={()=>navigate(-1)}>back</button>

    </>
  );
};
export default Error404;
