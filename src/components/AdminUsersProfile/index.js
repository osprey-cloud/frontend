import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import addUserCredits, {
  clearCreditsState,
} from "../../redux/actions/addCredits";
import "./AdminUserPage.css";
import Header from "../Header";
import Spinner from "../Spinner";
import InformationBar from "../InformationBar";
import Modal from "../Modal";
import DeleteWarning from "../../components/DeleteWarning";
import BlackInputText from "../BlackInputText";
import PrimaryButton from "../PrimaryButton";
import addBetaUser from "../../redux/actions/addBetaUser";
import adminGetUserCredits, {
  clearUserCredits,
} from "../../redux/actions/adminGetUserCredits";
import Feedback from "../Feedback";
import { getUser } from "../../helpers/projectName";
import { DisplayDateTime } from "../../helpers/dateConstants";
import { Link } from "react-router-dom";
import { getUserProjects } from "../../helpers/projectCount";
import NewResourceCard from "../NewResourceCard";
import userProfleStyles from "../UserProfile/UserProfile.module.css";
import Avatar from "../Avatar";
import moment from "moment";
import AppFooter from "../appFooter";
import {
  handleGetRequest,
  handlePostRequestWithOutDataObject,
} from "../../apis/apis";
import SettingsActionRow from "../SettingsActionRow";

class AdminUserPage extends Component {
  constructor() {
    super();
    this.state = {
      actionsMenu: false,
      betaUserModal: false,
      addCredits: false,
      credits: "",
      creditDescription: "",
      selectedUser: "",
      openDeleteAlert: false,
      openDisableAlert: false,
      error: "",
      hidden: true,
      userDetail: [],
      fetchingUserDetails: true,
    };
    this.showMenu = this.showMenu.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleBetaUserSubmit = this.handleBetaUserSubmit.bind(this);
    this.closeBetaUserModal = this.closeBetaUserModal.bind(this);
    this.showBetaUserModal = this.showBetaUserModal.bind(this);
    this.renderRedirect = this.renderRedirect.bind(this);
    this.hideCreditsModal = this.hideCreditsModal.bind(this);
    this.showCreditsModal = this.showCreditsModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleCreditSubmittion = this.handleCreditSubmittion.bind(this);
    this.handleDeleteAlert = this.handleDeleteAlert.bind(this);
    this.showDeleteAlert = this.showDeleteAlert.bind(this);
    this.hideDeleteAlert = this.hideDeleteAlert.bind(this);
    this.handleDisableAlert = this.handleDisableAlert.bind(this);
    this.showDisableAlert = this.showDisableAlert.bind(this);
    this.hideDisableAlert = this.hideDisableAlert.bind(this);
    this.getUserDetails = this.getUserDetails.bind(this);
  }
  componentDidMount() {
    const {
      adminGetUserCredits,
      clearUserCredits,
      clearCreditsState,
      match: { params },
    } = this.props;
    getUserProjects(params.userID).then((projectsCount) => {
      this.setState({
        projectsCount: projectsCount.projectsCount,
        activeProjectsCount: projectsCount.activeProjectsCount,
        disabledProjectsCount: projectsCount.disabledProjectsCount,
      });
    });
    clearCreditsState();
    clearUserCredits();
    adminGetUserCredits(params.userID);
    this.getUserDetails();
  }

  componentDidUpdate(prevProps) {
    const { Added, isDeleteUser, isDisableUser } = this.props;
    if (Added !== prevProps.Added) {
      this.hideCreditsModal();
    }
    if (isDeleteUser !== prevProps.DeleteUser) {
      this.hideDeleteAlert();
    }
    if (isDisableUser !== prevProps.DisableUser) {
      this.hideDeleteAlert();
    }
  }

  getUserDetails() {
    const {
      match: { params },
    } = this.props;
    const { userID } = params;
    handleGetRequest(`/users/${userID}`)
      .then((response) => {
        this.setState({
          userDetail: response.data.data.user,
          fetchingUserDetails: false,
        });
      })
      .catch((error) => {
        this.setState({
          error: "Failed to fetch user details",
          fetchingUserDetails: false,
        });
      });
  }

  handleDeleteAlert(e, userID) {
    const { deleteUser } = this.props;
    e.preventDefault();
    deleteUser(userID);
  }
  showDeleteAlert() {
    this.setState({ openDeleteAlert: true });
  }
  hideDeleteAlert() {
    this.setState({ openDeleteAlert: false });
  }
  handleDisableAlert(e, userID) {
    const { disableUser } = this.props;
    e.preventDefault();
    disableUser(userID);
  }
  showDisableAlert() {
    this.setState({ openDisableAlert: true });
  }
  hideDisableAlert() {
    this.setState({ openDisableAlert: false });
  }
  handleClick = (e) => {
    if (this.state.actionsMenu) {
      // this.closeModal();
      return;
    }
    this.setState({ actionsMenu: true });
    e.stopPropagation();
    document.addEventListener("click", this.hideModal);
  };

  hideModal = () => {
    this.setState({ actionsMenu: false });
    document.removeEventListener("click", this.hideModal);
  };

  showMenu(id) {
    this.setState({
      selectedUser: id,
    });
  }

  showBetaUserModal() {
    this.setState({
      betaUserModal: true,
    });
  }

  handleCreditSubmittion() {
    const { credits, creditDescription } = this.state;
    const {
      addUserCredits,
      match: { params },
    } = this.props;
    if (credits !== "" && creditDescription !== "") {
      const creditsObject = {
        amount: credits,
        description: creditDescription,
        user_id: params.userID,
      };
      addUserCredits(creditsObject);
    }
  }
  showCreditsModal() {
    this.setState({
      addCredits: true,
    });
  }
  hideCreditsModal = () => {
    const { clearCreditsState } = this.props;
    clearCreditsState();
    this.setState({
      addCredits: false,
      actionsMenu: false,
      credits: "",
      creditDescription: "",
      selectedUser: "",
    });
  };
  closeBetaUserModal() {
    this.setState({
      betaUserModal: false,
    });
  }
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  handleBetaUserSubmit() {
    const { selectedUser } = this.state;
    const { addBetaUser } = this.props;
    const betaUser = {
      is_beta_user: true,
      user_id: selectedUser,
    };
    addBetaUser(betaUser);
  }

  renderRedirect = () => {
    const { Added, isDeleteUser, isDisableUser } = this.props;

    if (Added) {
      return <Redirect to={`/accounts`} noThrow />;
    }
    if (isDeleteUser === "User Deleted Successfully") {
      this.hideDeleteAlert();
      return <Redirect to={`/accounts/&{user_id}`} noThrow />;
    }
    if (isDisableUser === "User Disabled Successfully") {
      this.hideDisableAlert();
      return <Redirect to={`/accounts/&{user_id}`} noThrow />;
    }
  };
  handleEnableButtonClick = () => {
    let { userDetail } = this.state;
    const { userID } = this.props.match.params;

    try {
      if (userDetail.disabled) {
        handlePostRequestWithOutDataObject(userID, `/users/${userID}/enable`)
          .then(() => {
            window.location.reload();
          })
          .catch((error) => {
            this.setState({
              error: error,
            });
          });
      } else {
        handlePostRequestWithOutDataObject(userID, `/users/${userID}/disable`)
          .then(() => {
            window.location.reload();
          })
          .catch((error) => {
            this.setState({
              error: error,
            });
          });
      }
    } catch (error) {
      console.error("API call error:", error);
    }
  };

  render() {
    const {
      users,
      isFetched,
      isFetching,
      Adding,
      Failed,
      userCredits,
      Added,
      isDeleteUser,
      isDisableUser,
      deletingUser,
      isDisablingUser,
      userDeleteFailed,
      userDisableFailed,
    } = this.props;
    const { userID } = this.props.match.params;
    const {
      match: { params },
    } = this.props;
    const {
      credits,
      creditDescription,
      openDeleteAlert,
      openDisableAlert,
      userDetail,
    } = this.state;
    const user = getUser(users, params.userID);
    const { credit_assignment_records } = userCredits;
    return (
      <div className="MainPage">
        {Added ? this.renderRedirect() : null}
        <div className="TopBarSection">
          <Header />
        </div>
        <div className="Mainsection">
          <div className="MainContentSection">
            <div className="InformationBarSection">
              <InformationBar
                header={
                  <span>
                    <Link className="breadcrumb" to={`/accounts`}>
                      Accounts
                    </Link>
                    / {user?.name}
                  </span>
                }
                showBtn={false}
                showBackBtn
              />
            </div>
            <div className="LeftAlignContainer">
              {userDetail.length === 0 ? (
                <div className="ResourceSpinnerWrapper">
                  <Spinner size="big" />
                </div>
              ) : (
                <>
                  <div className="ContentSection">
                    <div className="AdminUserPageContainer">
                      <section>
                        <div className="SectionTitle">Personal information</div>
                        <div className="AdminCardArea">
                          <div className="AdminUserProfileCard">
                            <div className="AdminUserProfileInfoSect">
                              <div className="AdminUserProfileInfoHeader">
                                <Avatar
                                  name={userDetail?.name}
                                  className={userProfleStyles.UserAvatarLarge}
                                />
                                <div className={userProfleStyles.Identity}>
                                  <div
                                    className={userProfleStyles.IdentityName}
                                  >
                                    {userDetail?.name}
                                    {userDetail?.is_beta_user === true && (
                                      <div
                                        className={userProfleStyles.BetaUserDiv}
                                      >
                                        Beta User
                                      </div>
                                    )}
                                  </div>
                                  <div
                                    className={userProfleStyles.IdentityEmail}
                                  >
                                    {userDetail?.email}
                                  </div>
                                </div>
                              </div>

                              <div className="AdminProfileRowInfo">
                                <div className="AdminProfileRowItem">
                                  Verified:
                                  <span>
                                    {userDetail?.verified ? "True" : "False"}
                                  </span>
                                </div>
                                |
                                <div className="AdminProfileRowItem">
                                  Role:
                                  <span>
                                    {userDetail?.roles?.length > 0
                                      ? userDetail?.roles[0].name
                                      : "None"}
                                  </span>
                                </div>
                                |
                                <div className="AdminProfileRowItem">
                                  Date Joined:
                                  <span>
                                    {moment(userDetail?.date_created)
                                      .utc()
                                      .format("ddd, MMMM DD, yyyy")}
                                  </span>
                                </div>
                                |
                                <div className="AdminProfileRowItem">
                                  Last Seen:
                                  <span>
                                    {userDetail?.last_seen
                                      ? moment(userDetail?.last_seen)
                                          .utc()
                                          .format("ddd, MMMM DD, yyyy")
                                      : "Not available"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                      {/* Credential history */}
                      {credit_assignment_records?.length > 0 && (
                        <div className="CreditsAlotted">
                          <div className="CreditsTable">
                            <div className="CreditsHeader">
                              Credits Assignment History
                            </div>
                            <div className="Credits">
                              <div className="CreditsHead">
                                <div className="CreditsHeaderRow">
                                  <div className="CreditsHeaderAttribute">
                                    Record ID
                                  </div>
                                  <div className="CreditsHeaderAttribute">
                                    Date & Time
                                  </div>
                                  <div className="CreditsHeaderAttribute">
                                    Amount
                                  </div>
                                  <div className="CreditsHeaderAttribute">
                                    Description
                                  </div>
                                </div>
                              </div>
                              <div className="CreditsBody">
                                {credit_assignment_records ? (
                                  credit_assignment_records.map((credit) => (
                                    <div className="CreditsHeaderRow">
                                      <div className="CreditsRowAttribute">
                                        {credit?.id}
                                      </div>
                                      <div className="CreditsRowAttribute">
                                        {DisplayDateTime(
                                          new Date(credit?.date_created)
                                        )}
                                      </div>
                                      <div className="CreditsRowAttribute">
                                        {credit?.amount}
                                      </div>
                                      <div className="CreditsRowAttribute">
                                        {credit?.description}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="CreditsError">
                                    <>No Credits Assigned.</>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="SectionTitle">
                          User Platform Metrics
                        </div>
                        <div className="Cluster1Container">
                          <NewResourceCard
                            key={1}
                            title="Projects Owned"
                            count={this.state.projectsCount}
                          />
                          <NewResourceCard
                            key={1}
                            title="Apps Deployed"
                            count={6}
                          />
                          <NewResourceCard
                            key={1}
                            title="Databases Created"
                            count={3}
                          />
                          <NewResourceCard
                            key={1}
                            title="Credits"
                            count={
                              user?.credits.length === 0
                                ? 0
                                : user?.credits[0].amount
                            }
                          />
                        </div>
                      </div>

                      <div className="SectionTitle">Manage User</div>
                      <div className="ProjectInstructions BigCard">
                        <div className="MemberBody">
                          <SettingsActionRow
                            title="Add Credits to User"
                            content="This will add credits to the user."
                            buttonLabel="Add Credits"
                            buttonColor="primary"
                            onButtonClick={this.showCreditsModal}
                          />

                          <SettingsActionRow
                            title={`${
                              userDetail?.disabled ? "Enable" : "Disable"
                            } User`}
                            content={
                              userDetail?.disabled
                                ? "This will enable this user."
                                : "This will temporary disable the user."
                            }
                            buttonLabel={
                              userDetail?.disabled ? "Enable" : "Disable"
                            }
                            buttonColor={
                              userDetail?.disabled ? "primary" : "red"
                            }
                            onButtonClick={this.handleEnableButtonClick}
                          />

                          <SettingsActionRow
                            title="Delete User"
                            content="This will permanently delete the user-history,apps,database and settings."
                            buttonLabel="Delete"
                            buttonColor="red"
                            onButtonClick={this.showDeleteAlert}
                          />
                        </div>
                      </div>
                      {openDeleteAlert && (
                        <div className="ProjectDeleteModel">
                          <Modal
                            showModal={openDeleteAlert}
                            onClickAway={this.hideDeleteAlert}
                          >
                            <div className="DeleteDatabaseModel">
                              <div className="DeleteProjectModalUpperSection">
                                <div className="InnerModalDescription">
                                  Are you sure you want to delete this user
                                  &nbsp;
                                  <span className="DatabaseName">
                                    {userDetail?.name} ?
                                  </span>
                                  <DeleteWarning />
                                </div>
                              </div>

                              <div className="DeleteProjectModalLowerSection">
                                <div className="DeleteProjectModelButtons">
                                  <PrimaryButton
                                    className="CancelBtn"
                                    onClick={this.hideDeleteAlert}
                                  >
                                    Cancel
                                  </PrimaryButton>
                                  <PrimaryButton
                                    color="red"
                                    onClick={(e) =>
                                      this.handleDeleteAlert(e, userID)
                                    }
                                  >
                                    {deletingUser ? <Spinner /> : "Delete"}
                                  </PrimaryButton>
                                </div>

                                {userDeleteFailed && isDeleteUser && (
                                  <Feedback
                                    message={isDeleteUser}
                                    type="error"
                                  />
                                )}
                              </div>
                            </div>
                          </Modal>
                        </div>
                      )}
                      {openDisableAlert && (
                        <div className="ProjectDeleteModel">
                          <Modal
                            showModal={openDisableAlert}
                            onClickAway={this.hideDisableAlert}
                          >
                            <div className="DeleteDatabaseModel">
                              <div className="DeleteProjectModalUpperSection">
                                <div className="InnerModalDescription">
                                  Are you sure you want to disable this user
                                  &nbsp;
                                  <span className="DatabaseName">
                                    {userDetail?.name} ?
                                  </span>
                                </div>
                              </div>

                              <div className="DeleteProjectModalLowerSection">
                                <div className="DeleteProjectModelButtons">
                                  <PrimaryButton
                                    className="CancelBtn"
                                    onClick={this.hideDisableAlert}
                                  >
                                    Cancel
                                  </PrimaryButton>
                                  <PrimaryButton
                                    color="red"
                                    onClick={(e) =>
                                      this.handleDisableAlert(e, userID)
                                    }
                                  >
                                    {isDisablingUser ? <Spinner /> : "Disable"}
                                  </PrimaryButton>
                                </div>

                                {userDisableFailed && isDisableUser && (
                                  <Feedback
                                    message={isDisableUser}
                                    type="error"
                                  />
                                )}
                              </div>
                            </div>
                          </Modal>
                        </div>
                      )}

                      {!isFetching && !isFetched && (
                        <div className="NoResourcesMessage">
                          <p>
                            Oops! Something went wrong! Failed to retrieve User
                            Profile.
                          </p>
                        </div>
                      )}
                    </div>
                    <Modal
                      showModal={this.state.addCredits}
                      onClickAway={() => this.hideCreditsModal()}
                    >
                      <div className="ModalHeader">
                        <h5 className="ModalTitle">Add Credits</h5>

                        <div className="">Number of credits</div>
                        <div className="ModalContent">
                          <BlackInputText
                            required
                            placeholder="Number of credits"
                            name="credits"
                            type="number"
                            value={credits}
                            onChange={(e) => {
                              this.handleChange(e);
                            }}
                          />
                        </div>
                        <div className="CreditsTitle">Description</div>
                        <textarea
                          className="TextArea"
                          type="text"
                          placeholder="Credits description"
                          rows="4"
                          cols="50"
                          name="creditDescription"
                          value={creditDescription}
                          onChange={(e) => {
                            this.handleChange(e);
                          }}
                        />
                      </div>
                      <div className="ModalFooter">
                        <div className="ModalButtons">
                          <PrimaryButton
                            className="CancelBtn"
                            onClick={() => this.hideCreditsModal()}
                          >
                            Cancel
                          </PrimaryButton>

                          <PrimaryButton
                            type="button"
                            onClick={() => this.handleCreditSubmittion()}
                          >
                            {Adding ? <Spinner /> : "Add"}
                          </PrimaryButton>
                        </div>
                        {Failed && (
                          <Feedback
                            message={"failed to add credits"}
                            type={"error"}
                          />
                        )}
                      </div>
                    </Modal>
                  </div>
                </>
              )}
            </div>
            <AppFooter />
          </div>
        </div>
      </div>
    );
  }
}

// inititate props
AdminUserPage.propTypes = {
  users: PropTypes.arrayOf(PropTypes.object),
  isFetching: PropTypes.bool,
  isFetched: PropTypes.bool,
};

// assigning defaults
AdminUserPage.defaultProps = {
  users: [],
  isFetching: false,
  isFetched: false,
};

export const mapStateToProps = (state) => {
  const { isFetching, users, isFetched } = state.usersListReducer;
  const { isAdded, isAdding, isFailed, error } = state.addBetaUserReducer;
  const { Added, Adding, Failed } = state.addUserCreditsReducer;
  const { userCredits, creditsFetched, isFetchingCredits, clearUserCredits } =
    state.adminGetUserCreditsReducer;
  return {
    isFetching,
    users,
    isFetched,
    isAdded,
    isAdding,
    isFailed,
    error,
    Added,
    Adding,
    Failed,
    userCredits,
    creditsFetched,
    isFetchingCredits,
    clearUserCredits,
  };
};

const mapDispatchToProps = {
  addBetaUser,
  addUserCredits,
  adminGetUserCredits,
  clearUserCredits,
  clearCreditsState,
};

export default connect(mapStateToProps, mapDispatchToProps)(AdminUserPage);
