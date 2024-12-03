import React from "react";
import axios from "axios";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import saveUser from "../../redux/actions/saveUser";
import InputText from "../../components/InputText";
import PrimaryButton from "../../components/PrimaryButton";
import Spinner from "../../components/Spinner";
import { API_BASE_URL } from "../../config";
import "../../pages/LoginPage/LoginPage.css";
import { ReactComponent as Open } from "../../assets/images/open.svg";
import { ReactComponent as Closed } from "../../assets/images/close.svg";
import { ReactComponent as Logo } from "../../assets/images/logo.svg";

class AdminLoginPage extends React.Component {
  constructor() {
    super();
    this.state = {
      email: "",
      password: "",
      loading: false,
      passwordShown: false,
      feedbackMessage: "",
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.togglePassword = this.togglePassword.bind(this);
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  togglePassword() {
    //this.setState({ hidden: !this.state.hidden });
    this.setState({ passwordShown: !this.state.passwordShown });
    this.fetchPassword();
  }

  handleSubmit(e) {
    e.preventDefault();

    const { saveUser } = this.props;

    const { email, password } = this.state;

    const adminCredentials = {
      email,
      password,
    };

    this.setState({
      loading: true,
    });

    axios
      .post(`${API_BASE_URL}/users/admin_login`, adminCredentials)
      .then((res) => {
        if (res.data.status === "success") {
          this.setState({
            loading: false,
          });

          // redirect to dashboard
          // save user data to store
          saveUser(res.data.data);
          localStorage.setItem("token", res.data.data.access_token);
          this.setState(
            {
              feedbackMessage: "Login Successful",
            },
            () => {
              window.location.href = "/clusters";
            }
          );
        }
      })
      .catch((err) => {
        this.setState({
          loading: false,
        });
      });
  }

  render() {
    const { email, password, loading, passwordShown } = this.state;

    return (
      <div className="SectionsContainer">
        <div className="RightSectionContent">
          <div className="LoginContentHeader">
            <Logo className="Brand" />
            <h1 className="LoginContentTitle">Admin Login</h1>
          </div>
          <form onSubmit={this.handleSubmit}>
            <div className="LoginContentInputs">
              {/* Input fields */}
              <InputText
                required
                placeholder="Email Address"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  this.handleChange(e);
                }}
              />
              <div className="password-wrapper">
                <InputText
                  required
                  placeholder="Password"
                  name="password"
                  type={passwordShown ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    this.handleChange(e);
                  }}
                />

                <div className="password" onClick={this.togglePassword}>
                  {passwordShown ? <Open /> : <Closed />}
                </div>
              </div>

              <div className="LoginLinkContainer">
                <Link to="/forgot-password" className="LoginContentLink">
                  Forgot your password?
                </Link>
              </div>

              <PrimaryButton onClick={this.handleSubmit} color="primary">
                {loading ? <Spinner /> : "login"}
              </PrimaryButton>

              <div className="LoginContentBottomLink LoginLinkContainer">
                <Link to="/" className="LoginContentLink">
                  Go to user login.
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({ user: state.user });

const mapDispatchToProps = {
  saveUser,
};

AdminLoginPage.propTypes = {
  saveUser: PropTypes.func.isRequired,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(AdminLoginPage));
