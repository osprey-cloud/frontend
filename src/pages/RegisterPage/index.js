import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import InputText from "../../components/InputText";
import PrimaryButton from "../../components/PrimaryButton";
import Spinner from "../../components/Spinner";
import { ReactComponent as LogoIcon } from "../../assets/images/githublogo.svg";
import { API_BASE_URL, GIT_REDIRECT_URL } from "../../config";
import Checkbox from "../../components/Checkbox";
import { ReactComponent as Open } from "../../assets/images/open.svg";
import { ReactComponent as Closed } from "../../assets/images/close.svg";
import "./RegisterPage.css";
import { ReactComponent as Logo } from "../../assets/images/logo.svg";

export default class RegisterPage extends Component {
  constructor() {
    super();

    this.state = {
      name: "",
      username: "",
      organisation: "",
      email: "",
      password: "",
      passwordConfirm: "",
      displayPassword: false,
      hasAgreed: false,
      loading: false,
      registered: false,
      gitLoading: false,
      error: "",
      passwordShown: false,
      passwordChecked: false,
      passwordValidations: {
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        isMinLength: false,
      },
    };

    this.handleOnChange = this.handleOnChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleAgreed = this.toggleAgreed.bind(this);
    this.validateEmail = this.validateEmail.bind(this);
    this.toGithubauth = this.toGithubauth.bind(this);
    this.togglePassword = this.togglePassword.bind(this);
    this.togglePasswordConfirm = this.togglePasswordConfirm.bind(this);
  }

  toggleAgreed() {
    const { hasAgreed, error } = this.state;
    this.setState({
      hasAgreed: !hasAgreed,
    });

    if (error) {
      this.setState({
        error: "",
      });
    }
  }
  toGithubauth = () => {
    // on return, github will be redricted to the login page where the
    // functions that handle the rest of the authrntications are
    const { hasAgreed } = this.state;
    if (hasAgreed) {
      this.setState({
        loading: true,
        gitLoading: true,
      });
      window.location.href = `${GIT_REDIRECT_URL}`;
    } else {
      this.setState({
        loading: false,
        gitLoading: false,
        error: "Please agree to our Terms of Service",
      });
    }
  };

  validatePassword(password) {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const isMinLength = password.length >= 8;

    this.setState({
      passwordValidations: {
        hasUppercase,
        hasLowercase,
        hasNumber,
        isMinLength,
      },
    });
  }

  handleOnChange(e) {
    const { error } = this.state;
    const { name, value } = e.target;

    if (name === "password") {
      this.validatePassword(value);
    }

    this.setState({
      [name]: value,
    });

    if (error) {
      this.setState({
        error: "",
      });
    }
  }

  validateEmail(email) {
    const emailRegEx =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegEx.test(String(email).toLowerCase());
  }
  togglePassword() {
    this.setState({ passwordShown: !this.state.passwordShown });
  }
  togglePasswordConfirm() {
    this.setState({ displayPassword: !this.state.displayPassword });
  }

  handleSubmit(e) {
    e.preventDefault();

    const {
      name,
      username,
      organisation,
      email,
      password,
      passwordConfirm,
      hasAgreed,
      passwordValidations,
    } = this.state;

    const userData = {
      name,
      username,
      organisation,
      email,
      password,
    };

    if (
      !email ||
      !password ||
      !name ||
      !username ||
      !passwordConfirm ||
      !organisation
    ) {
      this.setState({
        error: "Please enter all fields",
      });
    } else if (!name.trim()) {
      this.setState({
        error: "Please provide a valid username",
      });
    } else if (this.validateEmail(email) === false) {
      this.setState({
        loading: false,
        error: "Please provide a valid email address",
      });
    } else if (password !== passwordConfirm) {
      this.setState({
        loading: false,
        error: "Passwords do not match",
      });
    } else if (!hasAgreed) {
      this.setState({
        loading: false,
        error: "Please agree to our Terms of Service",
      });
    } else if (
      !passwordValidations.hasUppercase ||
      !passwordValidations.hasLowercase ||
      !passwordValidations.hasNumber ||
      !passwordValidations.isMinLength
    ) {
      this.setState({
        loading: false,
        error:
          "Password must contain at least one uppercase letter, one lowercase letter, a number and 8 characters long",
      });
    } else {
      this.setState({
        loading: true,
      });
      axios
        .post(`${API_BASE_URL}/users`, userData)
        .then((response) => {
          if (response.data.status === "success") {
            this.setState({
              loading: false,
              registered: true,
            });
          }
        })
        .catch((error) => {
          this.setState({
            loading: false,
            error: "Email already in use by another account.",
          });
        });
    }
  }

  render() {
    const {
      name,
      email,
      password,
      passwordConfirm,
      loading,
      registered,
      passwordShown,
      displayPassword,
      username,
      organisation,
      error,
      hasAgreed,
      gitLoading,
    } = this.state;
    if (registered)
      return (
        <div className="SectionsContainer">
          <div className="RightSectionContent">
            <div className="LoginContentHeader">
              <Logo className="Brand" />
              <h1 className="LoginContentTitle">Create an account</h1>
            </div>
            <div className="RegisterSuccessContent">
              <div className="RegisteredMessage">
                <h2>Thank you for registering with us!</h2>
                <p>
                  We&apos;ve sent a link to your email address:&nbsp;
                  <span>{email}</span>
                  .
                  <br />
                  <br />
                  The link will expire after 24 hours. Please use this link to
                  activate and start using your account.
                </p>
              </div>
            </div>
            <Link to="/login" className="LoginContentLink">
              Go to Login
            </Link>
          </div>
        </div>
      );
    return (
      <div className="SectionsContainer">
        <div className="RightSectionContent" style={{ width: "60%" }}>
          <div className="LoginContentHeader">
            <Logo className="Brand" />
            <h1 className="LoginContentTitle">Create an account</h1>
          </div>
          <form onSubmit={this.handleSubmit} className="LoginContentInputs">
            <InputText
              required
              placeholder="Name"
              name="name"
              value={name}
              onChange={this.handleOnChange}
            />
            <InputText
              required
              placeholder="Username"
              name="username"
              value={username}
              onChange={this.handleOnChange}
            />
            <InputText
              required
              placeholder="Organisation"
              name="organisation"
              value={organisation}
              onChange={this.handleOnChange}
            />
            <InputText
              required
              placeholder="Email Address"
              name="email"
              type="email"
              value={email}
              onChange={this.handleOnChange}
            />
            <div className="password-wrapper">
              <InputText
                required
                placeholder="Password"
                name="password"
                type={passwordShown ? "text" : "password"}
                value={password}
                onChange={this.handleOnChange}
              />
              <div className="password" onClick={this.togglePassword}>
                {passwordShown ? <Open /> : <Closed />}
              </div>
            </div>
            <div className="password-repeat">
              <InputText
                required
                placeholder="Repeat Password"
                name="passwordConfirm"
                type={displayPassword ? "text" : "password"}
                value={passwordConfirm}
                onChange={this.handleOnChange}
              />
              <div className="password" onClick={this.togglePasswordConfirm}>
                {displayPassword ? <Open /> : <Closed />}
              </div>
            </div>

            {error && <div className="RegisterErrorDiv">{error}</div>}
            <div className=" RegisterTerms">
              <Checkbox onClick={this.toggleAgreed} isChecked={hasAgreed} />
              <div>
                I agree to Crane Cloud{" "}
                <Link
                  to="/terms-of-service"
                  target="_blank"
                  className="LoginContentLink"
                >
                  Terms of service.
                </Link>
              </div>
            </div>

            <PrimaryButton
              className="LoginButton AuthBtn"
              type="submit"
              onClick={this.handleSubmit}
            >
              {loading ? <Spinner /> : "Register"}
            </PrimaryButton>
          </form>
          <div className="LowerLoginSection">
            <div>
              <p className="LoginWith">
                <span>Or join with</span>
              </p>
            </div>
            <PrimaryButton
              className="GithubLoginBtn AuthBtn"
              disabled={gitLoading}
              onClick={this.toGithubauth}
            >
              {gitLoading ? (
                <Spinner />
              ) : (
                <div className="GitLoginBtn">
                  <LogoIcon className="LogoIcon" />
                  <div className="GitText">Github</div>
                </div>
              )}
            </PrimaryButton>
          </div>
          <div className="LoginContentBottomLink LoginLinkContainer">
            Already have an account? &nbsp;
            <Link to="/login" className="LoginContentLink">
              Go to Login
            </Link>
          </div>
        </div>
        <div className="LeftSectionContent"></div>
      </div>
    );
  }
}
