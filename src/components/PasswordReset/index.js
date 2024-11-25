import React from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import InputText from "../InputText";
import PrimaryButton from "../PrimaryButton";
import Spinner from "../Spinner";
import { API_BASE_URL } from "../../config";
import "./PasswordReset.css";
import { ReactComponent as Logo } from "../../assets/images/logo.svg";

export default class PasswordReset extends React.Component {
  constructor() {
    super();
    this.state = {
      email: "",
      loading: false,
      registered: false,
      error: "",
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateEmail = this.validateEmail.bind(this);
  }

  handleChange(e) {
    const { error } = this.state;
    this.setState({
      [e.target.name]: e.target.value,
    });

    if (error) {
      this.setState({
        error: "",
      });
    }
  }
  componentDidMount() {
    localStorage.clear();
  }

  validateEmail(email) {
    const emailRegEx =
      // eslint-disable-next-line no-useless-escape
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegEx.test(String(email).toLowerCase());
  }

  handleSubmit() {
    const { email } = this.state;
    const userResetEmail = { email };

    if (!email) {
      this.setState({
        error: "Please enter your email",
      });
    } else if (this.validateEmail(email) === false) {
      this.setState({
        loading: false,
        error: "Please provide a valid email address",
      });
    } else {
      this.setState({
        loading: true,
      });

      axios
        .post(`${API_BASE_URL}/users/forgot_password`, userResetEmail)
        .then((response) => {
          if (response.data.status === "success") {
            this.setState({
              loading: false,
            });
            setTimeout(() => {
              this.setState({
                registered: true,
              });
            }, 1000);
          }
        })
        .catch((err) => {
          this.setState({
            loading: false,
            error: "Invalid user, please create an account",
          });
        });
    }
  }

  render() {
    const { email, loading, registered, error } = this.state;

    return (
      <div className="SectionsContainer">
        <div className="RightSectionContent">
          {!registered ? (
            <>
              <div className="ResetPasswordContent">
                <div className="ResetPasswordContentHeading">
                  <h1 className="LoginContentTitle">Password Reset</h1>
                  <p>
                    Enter your email address so that we can send you a link to
                    reset your password.
                  </p>
                </div>
                <div className="ResetPasswordContentInputs">
                  {/* Input fields */}
                  <InputText
                    required
                    placeholder="Email Address"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      this.handleChange(e);
                    }}
                  />
                  {error && (
                    <div className="ResetPasswordErrorDiv">{error}</div>
                  )}

                  <PrimaryButton onClick={this.handleSubmit} color="primary">
                    {loading ? <Spinner /> : "RESET"}
                  </PrimaryButton>

                  <div className="ResetPasswordContentBottomLink ResetPasswordLinkContainer">
                    <Link to="/login" className="LoginContentLink">
                      Back to Login.
                    </Link>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="ResetPasswordSuccessContent">
              <div className="ResetPasswordMessage">
                <h2>Password reset link sent!</h2>
                <p>
                  We&apos;ve sent a link to your email address to create a new
                  password:&nbsp;
                  <span>{email}</span>
                  <br />
                  <br />
                  The link will expire after 24 hours. Please use this link to
                  update password and resume using your account.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
