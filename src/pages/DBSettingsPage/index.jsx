import React from "react";
import PrimaryButton from "../../components/PrimaryButton";
import Spinner from "../../components/Spinner";
import Modal from "../../components/Modal";
import Feedback from "../../components/Feedback";
import DeleteWarning from "../../components/DeleteWarning";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import {
  handleGetRequest,
  handlePostRequestWithOutDataObject,
  handleDeleteRequest,
} from "../../apis/apis.js";
import { ReactComponent as CopyText } from "../../assets/images/copy.svg";
import { ReactComponent as Checked } from "../../assets/images/checked.svg";
import { ReactComponent as Open } from "../../assets/images/open.svg";
import { ReactComponent as Closed } from "../../assets/images/close.svg";
import BlackInputText from "../../components/BlackInputText";
import "./DBSettingsPage.css";
import { getProjectName } from "../../helpers/projectName";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import SettingsActionRow from "../../components/SettingsActionRow/index.jsx";
import SettingsModal from "../../components/SettingsModal/index.jsx";
import DisableModalContent from "../../components/DisableModalContent/index.jsx";
import styles from "../AppMetricsPage/AppMetricsPage.module.css";
import Tooltip from "../../components/Tooltip/index.js";
import { getRelativeTime } from "../../helpers/ageUtility.js";
import { databaseAxios } from "../../axios.js";

class DBSettingsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      openDeleteAlert: false,
      openResetAlert: false,
      error: "",
      hidden: true,
      nameChecked: false,
      portChecked: false,
      userChecked: false,
      hostChecked: false,
      uriChecked: false,
      newUriChecked: false,
      passwordChecked: false,
      openUpdateModal: false,
      newDatabasePassword: "",
      confirmNewDatabasePassword: "",
      disableDatabaseError: "",
      disableDatabaseAlert: false,
      disableDisableDatabaseProgress: false,
      // api states
      gettingDatabases: false,
      fetchingDatabaseErrors: "",
      currentDB: {},
      // getting password
      gettingPassword: false,
      getPasswordError: "",
      DBpassword: "",
      showPassword: false,
      // database password
      changingDBPassword: false,
      DBPasswordChangeError: "",
      // database reset
      resettingDB: false,
      resettingDBError: "",
      resettingResponseCode: "",
      //delete database
      deletingDB: false,
      deleteDBError: "",
    };

    this.handleDeleteDatabase = this.handleDeleteDatabase.bind(this);
    this.showDeleteAlert = this.showDeleteAlert.bind(this);
    this.hideDeleteAlert = this.hideDeleteAlert.bind(this);
    this.handleResetDatabase = this.handleResetDatabase.bind(this);
    this.showResetAlert = this.showResetAlert.bind(this);
    this.hideResetAlert = this.hideResetAlert.bind(this);
    this.togglePassword = this.togglePassword.bind(this);
    this.nameOnClick = this.nameOnClick.bind(this);
    this.portOnClick = this.portOnClick.bind(this);
    this.userOnClick = this.userOnClick.bind(this);
    this.hostOnClick = this.hostOnClick.bind(this);
    this.uriOnClick = this.uriOnClick.bind(this);
    this.uriCopyPostgresOnClickString =
      this.uriCopyPostgresOnClickString.bind(this);
    this.uriCopyPostgresOnClick = this.uriCopyPostgresOnClick.bind(this);
    this.passwordOnClick = this.passwordOnClick.bind(this);
    this.toggleShowPassword = this.toggleShowPassword.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.showUpdateModal = this.showUpdateModal.bind(this);
    this.hideUpdateModal = this.hideUpdateModal.bind(this);
    this.handleSubmitUpdate = this.handleSubmitUpdate.bind(this);
    this.fetchPassword = this.fetchPassword.bind(this);
    this.showDisableAlert = this.showDisableAlert.bind(this);
    this.hideDisableAlert = this.hideDisableAlert.bind(this);

    // api functions
    this.fetchSelectedDb = this.fetchSelectedDb.bind(this);
    this.fetchPasswordApis = this.fetchPasswordApis.bind(this);
    this.changeDatabasePassword = this.changeDatabasePassword.bind(this);
    this.resetDB = this.resetDB.bind(this);
    this.deleteDb = this.deleteDb.bind(this);
  }
  componentDidMount() {
    const { databaseID } = this.props.match.params;
    this.fetchSelectedDb(databaseID);
  }
  // componentDidUpdate(prevProps) {
  // }
  fetchSelectedDb(databaseID) {
    this.setState({
      gettingDatabases: true,
    });
    handleGetRequest(`/databases/${databaseID}`, databaseAxios)
      .then((response) => {
        this.setState({
          gettingDatabases: false,
          currentDB: response.data.data.database,
        });
      })
      .catch((error) => {
        this.setState({
          fetchingDatabaseErrors: "Failed to fetch database",
          gettingDatabases: false,
        });
      });
  }

  handleDeleteDatabase(e, projectID, databaseID) {
    e.preventDefault();
    this.deleteDb(projectID, databaseID);
  }

  showDeleteAlert() {
    this.setState({ openDeleteAlert: true });
  }

  hideDeleteAlert() {
    this.setState({ openDeleteAlert: false });
  }

  handleResetDatabase(e, projectID, databaseID) {
    e.preventDefault();
    this.resetDB(projectID, databaseID);
  }

  showResetAlert() {
    this.setState({ openResetAlert: true });
  }

  hideResetAlert() {
    this.setState({ openResetAlert: false });
  }

  // show update modal
  showUpdateModal() {
    this.setState({ openUpdateModal: true });
  }

  showDisableAlert() {
    this.setState({ disableDatabaseAlert: true });
  }

  hideDisableAlert() {
    this.setState({ disableDatabaseAlert: false });
  }

  toggleShowPassword() {
    this.setState((prevState) => ({ showPassword: !prevState.showPassword }));
  }

  // hide update modal
  hideUpdateModal() {
    this.setState({
      openUpdateModal: false,
      newDatabasePassword: "",
      confirmNewDatabasePassword: "",
    });
  }

  // handle input onchange
  handleChange(e) {
    const { error } = this.state;
    this.setState({
      [e.target.name]: e.target.value,
    });

    if (error) {
      this.setState({ error: "" });
    }
  }

  togglePassword() {
    this.setState({ hidden: !this.state.hidden });
    this.fetchPassword();
  }

  nameOnClick() {
    const { currentDB } = this.state;
    navigator.clipboard.writeText(currentDB.name);
    this.setState({ nameChecked: true });

    setTimeout(() => {
      this.setState({ nameChecked: false });
    }, 2000);
  }
  portOnClick() {
    const { currentDB } = this.state;
    navigator.clipboard.writeText(currentDB.port);
    this.setState({ portChecked: true });

    setTimeout(() => {
      this.setState({ portChecked: false });
    }, 2000);
  }
  hostOnClick() {
    const { currentDB } = this.state;
    navigator.clipboard.writeText(currentDB.host);
    this.setState({ hostChecked: true });

    setTimeout(() => {
      this.setState({ hostChecked: false });
    }, 2000);
  }
  userOnClick() {
    const { currentDB } = this.state;
    navigator.clipboard.writeText(currentDB.user);
    this.setState({ userChecked: true });

    setTimeout(() => {
      this.setState({ userChecked: false });
    }, 2000);
  }
  uriOnClick() {
    const { currentDB } = this.state;
    navigator.clipboard.writeText(
      `${`mysql -u ${currentDB.user} -p -P ${currentDB.port} -h ${currentDB.host} -D ${currentDB.name}`}`
    );
    this.setState({ uriChecked: true });

    setTimeout(() => {
      this.setState({ uriChecked: false });
    }, 2000);
  }

  uriCopyPostgresOnClickString() {
    const { currentDB } = this.state;
    navigator.clipboard.writeText(
      `postgresql://${currentDB.user}:${currentDB.password}@${currentDB.host}:${currentDB.port}/${currentDB.name}`
      // `postgresql://${currentDB?.user}:${currentDB?.password}@${currentDB?.host}:${currentDB?.port}/${currentDB?.name}`
    );
    this.setState({ newUriChecked: true });

    setTimeout(() => {
      this.setState({ newUriChecked: false });
    }, 2000);
  }

  uriCopyPostgresOnClick() {
    const { currentDB } = this.state;
    navigator.clipboard.writeText(
      `${`psql -h ${currentDB.host} -p ${currentDB.port} -d ${currentDB.name} -U ${currentDB.user} -W`}`
    );
    this.setState({ uriChecked: true });

    setTimeout(() => {
      this.setState({ uriChecked: false });
    }, 2000);
  }

  passwordOnClick() {
    const { currentDB } = this.state;
    navigator.clipboard.writeText(currentDB.password);
    this.setState({ passwordChecked: true });

    setTimeout(() => {
      this.setState({ passwordChecked: false });
    }, 2000);
  }

  fetchPassword() {
    const {
      match: {
        params: { databaseID },
      },
    } = this.props;
    this.fetchPasswordApis(databaseID);
  }
  fetchPasswordApis(databaseID) {
    this.setState({
      gettingPassword: true,
    });
    handleGetRequest(`/databases/${databaseID}/password`, databaseAxios)
      .then((response) => {
        this.setState({
          gettingPassword: false,
          DBpassword: response.data.data.password,
        });
      })
      .catch((error) => {
        this.setState({
          getPasswordError: "Failed to fetch database password",
          gettingPassword: false,
        });
      });
  }

  // handle submit for update modal
  handleSubmitUpdate() {
    const {
      match: {
        params: { projectID, databaseID },
      },
    } = this.props;

    const { newDatabasePassword, confirmNewDatabasePassword } = this.state;

    if (!newDatabasePassword || newDatabasePassword.length > 32) {
      this.setState({
        error: "Password should be at most 32 characters.",
      });
    } else if (newDatabasePassword !== confirmNewDatabasePassword) {
      this.setState({
        error: "The passwords do not match!",
      });
    } else if (newDatabasePassword.length < 8) {
      this.setState({
        error: "Password has to be more than 8 characters.",
      });
    } else {
      const newPassword = {
        password: newDatabasePassword,
      };
      // updateDatabasePassword(projectID, databaseID, newPassword);
      this.changeDatabasePassword(projectID, databaseID, newPassword);
    }
  }
  changeDatabasePassword(projectID, databaseID, newPassword) {
    this.setState({
      changingDBPassword: true,
      DBPasswordChangeError: "",
    });
    handlePostRequestWithOutDataObject(
      newPassword,
      `/databases/${databaseID}/reset_password`,
      databaseAxios
    )
      .then(() => {
        window.location.href = `/projects/${projectID}/databases/${databaseID}/settings`;
      })
      .catch((error) => {
        this.setState({
          changingDBPassword: false,
          DBPasswordChangeError: "Failed to update password",
        });
      });
  }
  resetDB(projectID, databaseID) {
    this.setState({
      resettingDB: true,
      resettingDBError: "",
      resettingResponseCode: "",
    });
    handlePostRequestWithOutDataObject(
      {},
      `/databases/${databaseID}/reset`,
      databaseAxios
    )
      .then((response) => {
        this.setState({
          resettingDB: false,
          resettingResponseCode: response.status,
        });
        this.hideResetAlert();
      })
      .catch((error) => {
        this.setState({
          changingDBPassword: false,
          DBPasswordChangeError: "Failed to reset password",
          resettingResponseCode: error.response.status,
        });
        this.hideResetAlert();
      });
  }
  deleteDb(projectID, databaseID) {
    this.setState({ deletingDB: true, deleteDBError: "" });
    handleDeleteRequest(`/databases/${databaseID}`, {}, databaseAxios)
      .then(() => {
        window.location.href = `/projects/${projectID}/databases`;
      })
      .catch(() => {
        this.setState({
          deleteProjectError: "Failed to delete this database",
          deletingProject: false,
        });
      });
  }
  handleEnableButtonClick = () => {
    let { currentDB } = this.state;
    const { databaseID } = this.props.match.params;
    this.setState({ disableDisableDatabaseProgress: true });

    try {
      if (currentDB.disabled) {
        handlePostRequestWithOutDataObject(
          {},
          `/databases/${databaseID}/enable`,
          databaseAxios
        )
          .then(() => {
            window.location.reload();
          })
          .catch((error) => {
            this.setState({
              disableDatabaseError: error,
              disableDisableDatabaseProgress: false,
            });
          });
      } else {
        handlePostRequestWithOutDataObject(
          {},
          `/databases/${databaseID}/disable`,
          databaseAxios
        )
          .then(() => {
            window.location.reload();
          })
          .catch((error) => {
            this.setState({
              disableDatabaseError: error,
              disableDisableDatabaseProgress: false,
            });
          });
      }
    } catch (error) {
      console.error("API call error:", error);
    }
  };

  render() {
    const { projects } = this.props;
    const { projectID, databaseID } = this.props.match.params;
    // const dbInfo = this.getDatabaseInfo(databaseID);
    const {
      openDeleteAlert,
      openResetAlert,
      hidden,
      nameChecked,
      portChecked,
      hostChecked,
      userChecked,
      uriChecked,
      newUriChecked,
      passwordChecked,
      openUpdateModal,
      newDatabasePassword,
      confirmNewDatabasePassword,
      gettingDatabases,
      currentDB,
      changingDBPassword,
      DBPasswordChangeError,
      resettingDB,
      resettingDBError,
      resettingResponseCode,
      deletingDB,
      deleteDBError,
      disableDatabaseError,
      disableDatabaseAlert,
      disableDisableDatabaseProgress,
    } = this.state;
    return (
      <DashboardLayout
        header={
          <>
            <Link
              className="breadcrumb"
              to={`/projects/${projectID}/databases/`}
            >
              Databases
            </Link>
            <span>/ DB settings</span>
          </>
        }
        name={getProjectName(projects, projectID)}
        short
      >
        {gettingDatabases ? (
          <div className="NoResourcesMessage">
            <div className="SpinnerWrapper">
              <Spinner size="big" />
            </div>
          </div>
        ) : (
          <>
            <div className="DatabaseSettingsInfo">
              <div className="SectionTitle">Database information</div>
              <div
                className={
                  styles.SummaryCardContainer +
                  " " +
                  styles.SummaryCardDimentions
                }
              >
                <div className={styles.CardHeaderSection}>
                  <div className={styles.CardTitle}>Database Summary</div>
                </div>
                <div className={styles.CardBodySection}>
                  <div className={styles.InnerCard}>
                    <div className={styles.InnerCardSections}>
                      <div className={styles.InnerContentGrid}>
                        <div className={styles.InnerTitlesStart}>Type</div>
                        <div className={styles.InnerContentName}>
                          {currentDB?.database_flavour_name === "mysql"
                            ? "MYSQL"
                            : "POSTGRESQL"}
                        </div>
                      </div>
                      <div
                        className={`${styles.InnerContentGrid} leftGridItem`}
                      >
                        <div
                          className={styles.InnerTitlesStart}
                          onClick={this.nameOnClick}
                        >
                          Database Name
                        </div>

                        <span
                          className={styles.InnerItemCopy}
                          onClick={this.nameOnClick}
                        >
                          <Tooltip
                            showIcon={false}
                            keyword={currentDB?.name}
                            message={
                              nameChecked
                                ? "✅ Copied to Clipboard"
                                : "Click to Copy Database Name"
                            }
                            position="left"
                          ></Tooltip>
                        </span>
                      </div>
                      <div
                        className={`${styles.InnerContentGrid} leftGridItem`}
                      >
                        <div className={styles.InnerTitlesStart}>
                          Database User
                        </div>

                        <span
                          className={styles.InnerItemCopy}
                          onClick={this.userOnClick}
                        >
                          <Tooltip
                            showIcon={false}
                            keyword={currentDB?.user}
                            message={
                              userChecked
                                ? "✅ Copied to Clipboard"
                                : "Click to Copy Database User"
                            }
                            position="right"
                          ></Tooltip>
                        </span>
                      </div>
                    </div>

                    <hr />
                    <div className={styles.InnerCardSections}>
                      <div className={styles.InnerContentGrid}>
                        <div className={styles.InnerTitlesMiddle}>Host</div>
                        <div
                          className={`${styles.InnerContentAge} middleGridItem`}
                        >
                          <span
                            className={styles.InnerItemCopy}
                            onClick={this.hostOnClick}
                          >
                            <Tooltip
                              showIcon={false}
                              keyword={currentDB?.host}
                              message={
                                hostChecked
                                  ? "✅ Copied to Clipboard"
                                  : "Click to Copy Database Host"
                              }
                              position="right"
                            ></Tooltip>
                          </span>
                        </div>
                      </div>
                      <div className={styles.InnerContentGrid}>
                        <div className={styles.InnerTitlesMiddle}>Port</div>
                        <div
                          className={`${styles.InnerContentAge} middleGridItem`}
                        >
                          <span
                            className={styles.InnerItemCopy}
                            onClick={this.portOnClick}
                          >
                            <Tooltip
                              showIcon={false}
                              keyword={currentDB?.port}
                              message={
                                portChecked
                                  ? "✅ Copied to Clipboard"
                                  : "Click to Copy Database Port"
                              }
                              position="right"
                            ></Tooltip>
                          </span>
                        </div>
                      </div>
                      <div className={styles.InnerContentGrid}>
                        <div className={styles.InnerTitlesMiddle}>
                          Database Status
                        </div>
                        <div className={styles.InnerContentAge}>
                          {currentDB?.db_status === false ? (
                            <span style={{ color: "red" }}>Down</span>
                          ) : (
                            "Ready"
                          )}
                        </div>
                      </div>
                    </div>
                    <hr />
                    <div className={styles.InnerCardSections}>
                      <div className={styles.InnerContentGrid}>
                        <div className={styles.InnerTitlesEnd}>
                          Database Password{" "}
                          <span
                            className="VisibilityIcon"
                            onClick={this.togglePassword}
                          >
                            {hidden ? <Open /> : <Closed />}
                          </span>
                        </div>
                        <div
                          className={`${styles.InnerContentEnd} rightGridItem`}
                        >
                          <span
                            className={styles.InnerItemCopy}
                            onClick={this.passwordOnClick}
                          >
                            {hidden ? (
                              <span onClick={this.togglePassword}>
                                Click here to copy password
                              </span>
                            ) : (
                              <Tooltip
                                showIcon={false}
                                keyword={currentDB?.password}
                                message={
                                  passwordChecked
                                    ? "✅ Copied to Clipboard"
                                    : "Click to Copy Password"
                                }
                                position="right"
                              ></Tooltip>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className={styles.InnerContentGrid}>
                        <div className={styles.InnerTitlesEnd}>Size</div>
                        <div className={styles.InnerContentEnd}>
                          {currentDB?.default_storage_kb}
                        </div>
                      </div>
                      <div className={styles.InnerContentGrid}>
                        <div className={styles.InnerTitlesEnd}>
                          Date Created
                        </div>
                        <div className={styles.InnerContentEnd}>
                          {getRelativeTime(currentDB?.date_created)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="DBSections">
                <div className="SectionTitle">Connect to database</div>
                {currentDB?.database_flavour_name === "mysql" ? (
                  <div className="BigCard DBInstructionsView">
                    <div className="SubTitle">Connect with terminal</div>
                    <div className="DBConnectionInfo">
                      <div className="DBInfoTop">
                        {/* TODO: Add mysql conncetion with DB URI */}
                        <div>
                          To connect to the database, copy and paste the command
                          below into your terminal. Refer to{" "}
                          <a
                            href="https://medium.com/cranecloud/connecting-to-a-remote-mysql-database-a6b3cc15c40b"
                            rel="noopener noreferrer"
                            target="_blank"
                            className="MysqlArticle"
                          >
                            this article
                          </a>
                          , for a more comprehensive guide.
                        </div>
                      </div>
                      <div className="DBInfoBottom">
                        <code className="DBAccessInfo">
                          {`mysql -u ${currentDB?.user} -p -P ${currentDB?.port} -h ${currentDB?.host} -D ${currentDB?.name}`}
                        </code>
                        <div className="DBAccessCopy">
                          <CopyText onClick={this.uriOnClick} />
                          {uriChecked ? <Checked /> : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="BigCard DBInstructionsView">
                    <div className="SubTitle">
                      Connect with a connection string
                    </div>
                    <div className="DBConnectionInfo">
                      <div className="DBInfoTop">
                        <div>
                          Following this format{" "}
                          <code>
                            postgresql://[user]:[password]@[host]:[port][/dbname]
                          </code>{" "}
                          <br />
                          To connect to the database, copy and paste the
                          following
                        </div>
                      </div>
                      <div className="DBInfoBottom">
                        <code className="DBAccessInfo">
                          {`postgresql://${currentDB?.user}:${currentDB?.password}@${currentDB?.host}:${currentDB?.port}/${currentDB?.name}`}
                        </code>
                        <div className="DBAccessCopy">
                          <div className="DBPassword">
                            <CopyText
                              onClick={this.uriCopyPostgresOnClickString}
                            />
                            {newUriChecked ? <Checked /> : null}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="SubTitle">Connect with terminal</div>
                    <div className="DBConnectionInfo">
                      <div className="DBInfoTop">
                        <div>
                          To connect to the database, copy and paste the command
                          below into your terminal. Refer to{" "}
                          <a
                            href="https://medium.com/cranecloud/connecting-to-a-remote-postgresql-database-779637147abf"
                            rel="noopener noreferrer"
                            target="_blank"
                            className="MysqlArticle"
                          >
                            this article
                          </a>
                          , for a more comprehensive guide.
                        </div>
                      </div>
                      <div className="DBInfoBottom">
                        <code className="DBAccessInfo">{`psql -h ${currentDB?.host} -p ${currentDB?.port} -d ${currentDB?.name} -U ${currentDB?.user} -W`}</code>
                        <div className="DBAccessCopy">
                          <div className="DBPassword">
                            <CopyText onClick={this.uriCopyPostgresOnClick} />
                            {uriChecked ? <Checked /> : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="SectionTitle">More Options</div>
              <div className="ProjectInstructions BigCard">
                <div className="MemberBody">
                  <SettingsActionRow
                    title="Change Password"
                    content="Update the password of this database."
                    buttonLabel="Change Password"
                    buttonColor="primary"
                    onButtonClick={this.showUpdateModal}
                  />

                  <SettingsActionRow
                    title="Reset Database"
                    content="Delete all data inside this database and restore it to its initial state."
                    buttonLabel="Reset"
                    buttonColor="red"
                    onButtonClick={this.showResetAlert}
                  />

                  {resettingDBError === "" && resettingResponseCode === 200 && (
                    <Feedback
                      message={"Database has been successfully reset."}
                      type={"success"}
                    />
                  )}
                  {resettingDBError !== "" && (
                    <Feedback message={resettingDBError} type={"error"} />
                  )}

                  <SettingsActionRow
                    title={
                      currentDB?.disabled
                        ? "Enable Database"
                        : "Disable Database"
                    }
                    content={
                      currentDB?.disabled
                        ? "This will enable this database."
                        : "This will temporary disable the database."
                    }
                    buttonLabel={currentDB?.disabled ? "Enable" : "Disable"}
                    buttonColor={currentDB?.disabled ? "primary" : "red"}
                    onButtonClick={this.showDisableAlert}
                  />

                  <SettingsActionRow
                    title="Delete Database"
                    content="Destroy the entire database, delete all tables and data
                  inside them."
                    buttonLabel="Delete"
                    buttonColor="red"
                    onButtonClick={this.showDeleteAlert}
                  />
                </div>
              </div>

              {openUpdateModal && (
                <div className="ProjectDeleteModel">
                  <Modal
                    showModal={openUpdateModal}
                    onClickAway={this.hideUpdateModal}
                  >
                    <div className="DeleteDatabaseModel">
                      <div className="DeleteProjectModalUpperSection">
                        <div className="ModalFormHeading">
                          <h2>Update database password</h2>
                        </div>
                        <div className="InnerModalDescription">
                          <BlackInputText
                            required
                            placeholder="New database Password"
                            name="newDatabasePassword"
                            value={newDatabasePassword}
                            onChange={(e) => {
                              this.handleChange(e);
                            }}
                          />
                          <BlackInputText
                            required
                            placeholder="Confirm New database Password"
                            name="confirmNewDatabasePassword"
                            value={confirmNewDatabasePassword}
                            onChange={(e) => {
                              this.handleChange(e);
                            }}
                          />
                        </div>
                      </div>
                      {DBPasswordChangeError && (
                        <Feedback
                          type="error"
                          message={DBPasswordChangeError}
                        />
                      )}
                      <div className="DeleteProjectModalLowerSection">
                        <div className="DeleteProjectModelButtons">
                          <PrimaryButton
                            className="CancelBtn"
                            onClick={this.hideUpdateModal}
                          >
                            Cancel
                          </PrimaryButton>
                          <PrimaryButton
                            color="primary"
                            onClick={this.handleSubmitUpdate}
                          >
                            {changingDBPassword ? <Spinner /> : "Update"}
                          </PrimaryButton>
                        </div>
                      </div>
                    </div>
                  </Modal>
                </div>
              )}
              {openDeleteAlert && (
                <div className="ProjectDeleteModel">
                  <Modal
                    showModal={openDeleteAlert}
                    onClickAway={this.hideDeleteAlert}
                  >
                    <div className="DeleteDatabaseModel">
                      <div className="DeleteProjectModalUpperSection">
                        <div className="InnerModalDescription">
                          Are you sure you want to delete this database &nbsp;
                          <span className="DatabaseName">
                            {currentDB.name} ?
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
                              this.handleDeleteDatabase(
                                e,
                                projectID,
                                databaseID
                              )
                            }
                          >
                            {deletingDB ? <Spinner /> : "Delete"}
                          </PrimaryButton>
                        </div>

                        {deleteDBError && (
                          <Feedback message={deleteDBError} type="error" />
                        )}
                      </div>
                    </div>
                  </Modal>
                </div>
              )}

              {openResetAlert && (
                <div className="ProjectDeleteModel">
                  <Modal
                    showModal={openResetAlert}
                    onClickAway={this.hideResetAlert}
                  >
                    <div className="DeleteDatabaseModel">
                      <div className="DeleteProjectModalUpperSection">
                        <div className="InnerModalDescription">
                          Are you sure you want to reset this database &nbsp;
                          <span className="DatabaseName">
                            {currentDB.name} ?
                          </span>
                          <DeleteWarning />
                        </div>
                      </div>

                      <div className="DeleteProjectModalLowerSection">
                        <div className="DeleteProjectModelButtons">
                          <PrimaryButton
                            className="CancelBtn"
                            onClick={this.hideResetAlert}
                          >
                            Cancel
                          </PrimaryButton>
                          <PrimaryButton
                            color="red"
                            onClick={(e) =>
                              this.handleResetDatabase(e, projectID, databaseID)
                            }
                          >
                            {resettingDB ? <Spinner /> : "Reset"}
                          </PrimaryButton>
                        </div>
                      </div>
                    </div>
                  </Modal>
                </div>
              )}
            </div>
          </>
        )}

        {disableDatabaseAlert && (
          <SettingsModal
            showModal={disableDatabaseAlert}
            onClickAway={this.hideDisableAlert}
          >
            <DisableModalContent
              item={{
                name: currentDB?.name,
                type: "database",
                disabled: currentDB?.disabled,
              }}
              disableProgress={disableDisableDatabaseProgress}
              handleDisableButtonClick={() => {
                this.handleEnableButtonClick();
              }}
              hideDisableAlert={this.hideDisableAlert}
              message={disableDatabaseError}
              isFailed={disableDatabaseError ? true : false}
            />
          </SettingsModal>
        )}
      </DashboardLayout>
    );
  }
}

export const mapStateToProps = (state) => {
  const { projects } = state.userProjectsReducer;
  return {
    projects,
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(DBSettingsPage);
