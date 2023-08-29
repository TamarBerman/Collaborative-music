import { Collapse,Divider } from 'antd';
import '../App.css'
const Panel = Collapse.Panel;

const text1 = `
  We are happy to join you in our FREE colabrative music site.\n
  Our goal is to provide a comfortarble way for listening to music.\n
  We belive music has a big affect on life, healing, soothing, and just makes pepole hapy.
  We are happy to let you to get the most from it, and enjoy all the in a comfortable and pleasant way.
  ENJOY!
`;
const text2 = `
  In our site you can view all songs, with pagination for your experience.
  you can sort and filter, listen to a song download, and add to your own playlist.
  uplaod a song wuth an image you choose, and everyone will enjoy it. 
  Only registered users can upload and have thier own playlist.
  but anyone can come and br a part of our comunity for free.
`;
const text3 = `
  Tamar Berman | proffecient software develover, with in-depth knowlege in a viriety of languages and technologies.
  Be in touch: Tamar3242643@gmail.com | 058.3242643 .
  All rights reserved.
`;

const customDividerStyle = {
  height: "10px", // Adjust the height to make it bigger
  border: "none", // Remove the default border
  fontSize: "24px", // Adjust the font size to make it bigger
  marginBottom: "60px",
  marginTop: "40px",
};
const About=()=> {

    return (
        <>
    {/* <h1>Questions & Answers</h1> */}
    <div
        style={{
          width: "80%",
          margin: "auto",
        }}
      >
        <Divider style={customDividerStyle}>Questions & Answers</Divider>
    
        <Collapse bordered={false} >
    <Panel header="What is this site?" key="1">
      <p>{text1}</p>
    </Panel>
    <Panel header="How to use?" key="2">
      <p>{text2}</p>
    </Panel>
    <Panel header="creators" key="3">
      <p>{text3}</p>
    </Panel>    
  </Collapse> 
  </div> 
  
  </>);
}

export default About;
