// ProtectedRoute.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { initialSignIn } from '../../redux/admin/adminActions';

function ProtectedRoute({ admin, initialSignIn, children }) {
   const navigate = useNavigate();

   useEffect(() => {
      const token = localStorage.getItem('adminAuthToken');
      if (!token) {
         navigate('/login');
      } else {
         initialSignIn(token)
            .then(() => console.log('Initial sign-in success'))
            .catch((err) => console.error('Initial sign-in error:', err));
      }
   }, [initialSignIn, navigate]);

   return <React.Fragment>{children}</React.Fragment>;
}


const mapStateToProps = (state) => {
   return { admin: state.admin };
};

const mapDispatchToProps = (dispatch) => {
   return {
      initialSignIn: (token) => dispatch(initialSignIn(token)),
   };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProtectedRoute);
