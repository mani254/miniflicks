import React, { useState } from 'react';
import { TextInput, PasswordInput } from '../components/formComponents/FormComponents';
import Button from '../components/button/Button';
import { connect } from 'react-redux';

import { adminLogin } from '../redux/admin/adminActions';
import { showNotification } from '../redux/notification/notificationActions';
// import Modal from '../components/modal/Modal';
import '../styles/LoginPage.css';

function LoginPage({ adminLogin, showNotification }) {
   const [logInDetails, setLoginDetails] = useState({ email: '', password: '' });

   function handleChange(e) {
      setLoginDetails({ ...logInDetails, [e.target.name]: e.target.value });
   }

   async function handleSubmit(e) {
      e.preventDefault();

      await adminLogin(logInDetails.email, logInDetails.password)
         .then(res => {
            console.log(res);
            showNotification(res.data.message)
         })
         .catch(err => {
            console.log(err);
            showNotification(err.response ? err.response.data.error : "Network Error")
         });
   }

   return (
      <section className='login-section'>
         <form className='login-container' onSubmit={handleSubmit}>
            <h4 className='text-center'>Admin Login</h4>
            <TextInput type="email" id="login-input" name="email" label="Email" value={logInDetails.email} variant="variant-1" onChange={handleChange} />
            <PasswordInput id="password-input" name="password" label="Password" value={logInDetails.password} variant="variant-1" onChange={handleChange} />
            <Button className='btn-1 primary m-auto d-block mt-3' type="submit" >Login</Button>
         </form>
      </section>
   )
}

const mapDispatchToProps = (dispatch) => {
   return {
      adminLogin: (email, password) => dispatch(adminLogin(email, password)),
      showNotification: (message) => dispatch(showNotification(message))
   }
}

export default connect(null, mapDispatchToProps)(LoginPage);
