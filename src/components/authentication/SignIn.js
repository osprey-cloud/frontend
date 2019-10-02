import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect, withRouter, Link } from 'react-router-dom';
import axios from 'axios';

import logOutAction from '../../redux/actions/auth/logoutAction';
import { BASE_URL } from '../../config';
import loginSuccess from '../../redux/actions/auth/loginSuccess';
import HeaderComponent from '../homepage/header';

import '../../assets/css/auth.css';

class SignInForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      submitButtonValue: 'Sign In',
      buttonClass: 'form-field-button',
      loginError: ''
    };
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
      loginError: ''
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({
      submitButtonValue: 'Processing ....',
      buttonClass: 'form-field-button-processing'
    });
    /**
     * make api call
     */
    const { email, password } = this.state;
    const payload = { email, password };

    axios.post(`${BASE_URL}/login`, payload)
      .then((response) => {
        if (response.status === 200) {
          loginSuccess({ accessToken: response.data.access_token });
        }
      })
      .catch((loginError) => {
        if (loginError.response && loginError.response.status && loginError.response.status === 401) {
          this.setState({
            password: '',
            submitButtonValue: 'Sign In',
            buttonClass: 'form-field-button',
            loginError: 'Wrong email or password'
          });
        } else if (loginError.response && loginError.response.data && loginError.response.data.message) {
          this.setState({
            password: '',
            submitButtonValue: 'Sign In',
            buttonClass: 'form-field-button',
            loginError: loginError.response.data.message
          });
        } else if (loginError.response && loginError.response.statusText) {
          this.setState({
            password: '',
            submitButtonValue: 'Sign In',
            buttonClass: 'form-field-button',
            loginError: `Error occured: ${loginError.response.statusText}. Please try again `
          });
        } else {
          this.setState({
            password: '',
            submitButtonValue: 'Sign In',
            buttonClass: 'form-field-button',
            loginError: `Error occured: ${loginError.message}. Please try again`
          });
        }
      });
  };

  // eslint-disable-next-line class-methods-use-this
  componentDidMount() {
    /* dispatch logout action after call to /login */
    logOutAction();
  }


  displayLoginError = (loginError) => {
    if (loginError) {
      return (
        <div className="alert alert-danger text-center">
          {loginError}
        </div>);
    }
    return undefined;
  }

  render() {
    const { buttonClass, submitButtonValue, loginError } = this.state;
    const { loggedIn } = this.props;

    if (loggedIn) {
      return <Redirect to="/user-dashboard" />
    }

    return (
      <>
        <div className="home-container">
          <HeaderComponent />
        </div>
        <div className="auth-form">
          <form onSubmit={this.handleSubmit}>

            {this.displayLoginError(loginError)}

            <div className="form-title">
              Sign In
        </div>
            <div className="form-field">
              <input
                type="email"
                placeholder="Enter your email"
                name="email"
                value={this.state.email}
                onChange={this.handleChange}
                required autoFocus
              />
            </div>

            <div className="form-field">
              <input
                type="password"
                placeholder="Enter password"
                name="password"
                value={this.state.password}
                onChange={this.handleChange}
                required
              />
            </div>

            <button className={buttonClass}>{submitButtonValue}</button>

            <Link to="/forgot-password" className="form-field-link">Forgot password?</Link>
            <p className="redirect">Not yet a member? <Link to="/register" className="form-field-link">Create an account</Link></p>

          </form>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    loggedIn: state.auth.loggedIn
  }
}

export default withRouter(connect(mapStateToProps)(SignInForm));
