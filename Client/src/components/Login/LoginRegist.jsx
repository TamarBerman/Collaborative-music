//כניסה באמצעות גוגל
import  { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

function LoginRegist() {
const [ user, setUser ] = useState([]);
    const [ profile, setProfile ] = useState([]);

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => setUser(codeResponse),
        onError: (error) => console.log('Login Failed:', error)
    });

    useEffect(
        () => {
            if (user) {
                axios
                    .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
                        headers: {
                            Authorization: `Bearer ${user.access_token}`,
                            Accept: 'application/json'
                        }
                    })
                    .then((res) => {
                        setProfile(res.data);
                    })
                    .catch((err) => console.log(err));
            }
        },
        [ user ]
    );

    // log out function to log the user out of google and set the profile array to null
    const logOut = () => {
        googleLogout();
        setProfile(null);
    };

    return (
      <div>
          <h2>React Google Login</h2>
          <br />
          <br />
          {profile ? (
              <div>
                  <img src={profile.picture} alt="user image" />
                  <h3>User Logged in</h3>
                  <p>Name: {profile.name}</p>
                  <p>Email Address: {profile.email}</p>
                  <br />
                  <br />
                  <button onClick={logOut}>Log out</button>
              </div>
          ) : (
              <button onClick={() => login()}>Sign in with Google 🚀 </button>
          )}
      </div>
  );
}
export default LoginRegist;

//ולידציות מסוג HOOK

// import { useForm } from 'react-hook-form';

// function Login() {
//   const { register, handleSubmit, formState: { errors } } = useForm();
  
//   const onSubmit = (data) => {
//     console.log(data);
//   };
  
//   return (
//     <form onSubmit={handleSubmit(onSubmit)}>
//       <label>Email</label>
//       <input type="email" {...register("email", { required: true, pattern: /^\S+@\S+$/i })} />
//       {errors.email && <p>Email is required and must be valid</p>}
      
//       <label>Password</label>
//       <input type="password" {...register("password", { required: true })} />
//       {errors.password && <p>Password is required</p>}
      
//       <button type="submit">Submit</button>
//     </form>
//   );
// }

// export default Login;


// ולידציות וטפס MDB
/* eslint-disable no-unused-vars */
// import {
//   MDBContainer,
//   MDBBtn,
//   MDBIcon,
//   MDBInput,
//   MDBCheckbox,

// } from "mdb-react-ui-kit";

// export default function Login() {
//     const [formData, setFormData] = useState({name: "",email: "",password: ""});
//     const [emailError,setEmailError] = useState(null);
//     const [nameError,setNameError] = useState(null);
//     const [passwordError,setPasswordError] = useState(null);
//     const emailPattern = /^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/;
//     const passwordPattern = /^[a-zA-Z0-9!@#$%]*$/

//     const handleChange = (event) => {
//       const { name, value } = event.target;
//       const val=event.target.value;
//       setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
//       if (name== 'name' ){
//         if (value.length< 3)
//             setNameError('Name must be at least 2 characters')
//         else
//             setNameError(null);
//       }
//       if(name=='email' )
//         if (!value.includes('@'))
//             setEmailError('Email must have @..')
//         else if (!emailPattern.test(value))
//             setEmailError('Not correct email....')
//         else
//             setEmailError(null);
//     if (name=='password')
//         if (value.length<=5)
//             setPasswordError('Password must be at least 5 characters')
//         else if (!passwordPattern.test(value))
//             setPasswordError('Password not strong')
//         else
//             setPasswordError(null);
//     };
  
//     const handleSubmit = (event) => {
//       event.preventDefault();
      
//         if (formData.name.length< 3)
//             setNameError('Name must be at least 2 characters')
//         if (!formData.email.includes('@'))
//             setEmailError('Email must have @..')
//         else if (!emailPattern.test(formData.email))
//             setEmailError('Not correct email....')
//         if (formData.password.length<=5)
//             setPasswordError('Password must be at least 5 characters')
//         else if (!passwordPattern.test(formData.password))
//             setPasswordError('Password not strong')
//         else{
//             setNameError(null);
//             setEmailError(null);
//             setPasswordError(null);
//             setFormData({name: "",email: "",password: ""});
//             alert(`Name: ${formData.name}, Email: ${formData.email}, password: ${formData.password}`);
//         }
    
//   };
  
//     return (
// <>
// <MDBContainer className="p-3 my-5 d-flex flex-column w-50">
//     <div className="text-center mb-3">
//         <p>Sign in with:</p>
//         <div className='d-flex justify-content-between mx-auto' style={{width: '40%'}}>
//           <MDBBtn tag='a' color='none' className='m-1' style={{ color: '#1266f1' }}>
//             <MDBIcon fab icon='facebook-f' size="sm"/>
//           </MDBBtn>
//           <MDBBtn tag='a' color='none' className='m-1' style={{ color: '#1266f1' }}>
//             <MDBIcon fab icon='twitter' size="sm"/>
//           </MDBBtn>
//           <MDBBtn tag='a' color='none' className='m-1' style={{ color: '#1266f1' }}>
//             <MDBIcon fab icon='google' size="sm"/>
//           </MDBBtn>
//           <MDBBtn tag='a' color='none' className='m-1' style={{ color: '#1266f1' }}>
//             <MDBIcon fab icon='github' size="sm"/>
//           </MDBBtn>
//         </div>
//         <p className="text-center mt-3">or:</p>
//     </div>
//     <form onSubmit={handleSubmit}>
//         <MDBInput wrapperClass="mb-0" label="User name" type="text" name="name" value={formData.name} onChange={handleChange}/>
//         {!nameError && <div className="mb-4"></div>}
//         {nameError && <div className="mb-2" style={{ color: 'red' }}>{nameError}</div>}
//         <MDBInput wrapperClass="mb-0" label="Email address" type="email" id="email" name="email"  value={formData.email} onChange={handleChange}/>
//         {!emailError && <div className="mb-4"></div>}
//         {emailError && <div className="text-left font-weight-light mb-2" style={{ color: 'red' }}>{emailError}</div>}
//         <MDBInput wrapperClass="mb-0" label="Password" type="password" id="password" name="password" value={formData.password} onChange={handleChange}/>
//         {!passwordError && <div className="mb-4"></div>}
//         {passwordError && <div className="mb-2" style={{color: 'red' }}>{passwordError}</div>}
//         <div className="d-flex justify-content-between mx-4 mb-4">
//             <MDBCheckbox name='flexCheck' value='' id='flexCheckDefault' label='Remember me' />
//             <a href="!#">Forgot password?</a>
//         </div>
//         <MDBBtn className="mb-4 w-100">Sign in</MDBBtn>
//     </form>
      
//       <p className="text-center">Not a member? <a href="#!">Register</a></p>
//       </MDBContainer>
// </> 
//     );
// }
