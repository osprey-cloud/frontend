import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import DomainInstructionsContent from "../../components/DomainInstructionsContent";
import updateApp, { clearUpdateAppState } from "../../redux/actions/updateApp";
import RollbackConfirmationContent from "../../components/RollbackContent";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import deleteApp, { clearState } from "../../redux/actions/deleteApp";
import EnvironmentAndPortsTab from "../../components/EnvironmentsTab";
import GeneralDetailsTab from "../../components/GeneralDetailsTab";
import SettingsActionRow from "../../components/SettingsActionRow";
import DisableModalContent from "../../components/DisableModalContent";
import ImageSettingsTab from "../../components/ImageSettingsTab";
import DeleteAppContent from "../../components/DeleteAppContent";
import DomainAndUrlsTab from "../../components/DomainAndUrlsTab";
import SettingsModal from "../../components/SettingsModal";
import RevisionsList from "../../components/RevisionList";
import Pagination from "../../components/Pagination";
import usePaginator from "../../hooks/usePaginator";
import Feedback from "../../components/Feedback";
import Spinner from "../../components/Spinner";
import TabItem from "../../components/TabItem";
import getSingleApp, {
  clearFetchAppState,
} from "../../redux/actions/getSingleApp";
import getAppRevisions, {
  clearFetchAppRevisionsState,
} from "../../redux/actions/getRevisions";
import {
  handleGetRequest,
  handlePostRequestWithOutDataObject,
} from "../../apis/apis";
import "./AppSettingsPage.css";
import { validateDomain } from "../../helpers/validation";
import revertUrl, { clearUrlRevertState } from "../../redux/actions/revertUrl";

const AppSettingsPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { appID } = useParams();

  const loggedInUser = useSelector((state) => state.user);
  const { app, isRetrieving, isFetched } = useSelector(
    (state) => state.singleAppReducer
  );
  const { isUpdating, errorMessage } = useSelector(
    (state) => state.updateAppReducer
  );
  const { isDeleting, isFailed, message } = useSelector(
    (state) => state.deleteAppReducer
  );
  const { isReverting } = useSelector((state) => state.revertUrlReducer);
  const { revisions, isFetching, pagination } = useSelector(
    (state) => state.appRevisionsReducer
  );

  const tabNames = [
    "General Details",
    "Image Settings",
    "Environment and Ports",
    "Domain and URLs",
  ];

  const replicaOptions = [
    { id: 1, name: "1" },
    { id: 2, name: "2" },
    { id: 3, name: "3" },
    { id: 4, name: "4" },
  ];

  const [activeTab, setActiveTab] = useState("General Details");
  const [currentPage, handleChangePage] = usePaginator();
  const [parentProject, setParentProject] = useState("");
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
  const [error, setError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [envError, setEnvError] = useState("");
  const [portError, setPortError] = useState("");
  const [commandError, setCommandError] = useState("");
  const [disableDelete, setDisableDelete] = useState(true);
  const [ConfirmAppname, setConfirmAppname] = useState("");
  const [domainModal, setDomainModal] = useState(false);
  const [newImage, setNewImage] = useState("");
  const [urlChecked, setUrlChecked] = useState(false);
  const [internalUrlChecked, setInternalUrlChecked] = useState(false);
  const [isPrivateImage, setIsPrivateImage] = useState(false);
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [domainName, setDomainName] = useState("");
  const [varName, setVarName] = useState("");
  const [varValue, setVarValue] = useState("");
  const [envVars, setEnvVars] = useState({});
  const [entryCommand, setEntryCommand] = useState("");
  const [port, setPort] = useState("");
  const [replicas, setReplicas] = useState("");
  const [revisionId, setRevisionId] = useState("");
  const [rollBackConfirmationModal, setRollBackConfirmationModal] =
    useState(false);
  const [revisingApp, setRevisingApp] = useState(false);
  const [revisingAppError, setRevisingAppError] = useState("");
  const [loadingIndex, setLoadingIndex] = useState(null);
  const [showAppDisableModal, setShowAppDisableModal] = useState(false);
  const [appDisableProgress, setAppDisableProgress] = useState(false);
  const [dockerCredentials, setDockerCredentials] = useState({
    username: "",
    email: "",
    password: "",
    server: "",
    error: "",
  });

  const applicationRevisions = useCallback(
    () => dispatch(getAppRevisions(appID, currentPage)),
    [dispatch, appID, currentPage]
  );

  useEffect(() => {
    if (appID) {
      // Clear the state before fetching new app data and revisions
      dispatch(clearFetchAppState());
      dispatch(getSingleApp(appID));
    }
    // The cleanup function here is called when the component unmounts
    return () => {
      dispatch(clearFetchAppState());
    };
  }, [appID, dispatch]);

  useEffect(() => {
    applicationRevisions();
    // The cleanup function here is called when the component unmounts
    return () => {
      dispatch(clearFetchAppRevisionsState());
    };
  }, [applicationRevisions, dispatch]);

  useEffect(() => {
    dispatch(getAppRevisions(appID, currentPage));
    // The cleanup function here is called when the component unmounts
    return () => {
      dispatch(clearFetchAppRevisionsState());
    };
  }, [appID, currentPage, dispatch]);

  useEffect(() => {
    if (app.command) {
      setEntryCommand(app.command);
    }
    if (app.port) {
      setPort(app.port);
    }
  }, [app?.command, app?.port]);

  const fetchProjectDetails = useCallback(() => {
    handleGetRequest(`/projects/${app?.project_id}`)
      .then((response) => {
        setParentProject(response.data.data.project);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [app?.project_id]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  useEffect(() => {
    setEnvVars(app?.env_vars || {});
  }, [app?.env_vars]);

  // Handlers
  const handlePageChange = (currentPage) => {
    handleChangePage(currentPage);
    applicationRevisions();
  };

  const handleDeleteApp = (e, appId) => {
    e.preventDefault();

    dispatch(deleteApp(appId))
      .then(() => {
        dispatch(clearState());
        // redirect user to the project apps dashboard page
        const projectID = app.project_id;
        window.location.href = `/projects/${projectID}/dashboard`;
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        dispatch(clearState());
      });
  };

  const handleImageChange = (e) => {
    setNewImage(e.target.value);
  };

  const handleSelectReplicas = (selectedOption) => {
    setReplicas(selectedOption.id);
  };

  const handleDockerCredentialsChange = (e) => {
    const { name, value } = e.target;
    setDockerCredentials((prevCredentials) => ({
      ...prevCredentials,
      [name]: value,
    }));
  };

  const handleImageSectionSubmit = () => {
    const projectID = app.project_id;
    let updatePayload = {
      ...(newImage !== app?.image && { image: newImage }),
      ...(replicas !== app?.replicas && { replicas }),
      ...(isPrivateImage && { privateImage: isPrivateImage }),
      ...dockerCredentials,
    };

    // Remove keys with empty string values
    updatePayload = Object.entries(updatePayload).reduce(
      (acc, [key, value]) => {
        if (value !== "") {
          acc[key] = value;
        }
        return acc;
      },
      {}
    );

    // Check if the payload is empty (no changes)
    if (Object.keys(updatePayload).length === 0) {
      setSubmitMessage("No changes to submit.");
    } else {
      dispatch(updateApp(appID, updatePayload))
        .then(() => {
          dispatch(clearUpdateAppState());
          setSubmitMessage("Update successful.");
          window.location.href = `/projects/${projectID}/apps/${appID}/settings`;
        })
        .catch((error) => {
          dispatch(clearUpdateAppState());
          console.error("Update failed:", error);
          setSubmitMessage("Update failed, please try again.");
        });
    }
  };

  const rollbackApp = (revisionId) => {
    const projectID = app.project_id;
    setRevisingApp(true);

    handlePostRequestWithOutDataObject(
      revisionId,
      `/apps/${appID}/revise/${revisionId}`
    )
      .then(() => {
        window.location.href = `/projects/${projectID}/apps/${appID}/settings`;
        setRevisingApp(false);
      })
      .catch((error) => {
        setError(error);
        setRevisingApp(false);
      });
  };

  const handleEnvChange = (e) => {
    const { name, value } = e.target;

    if (name === "varName") {
      setVarName(value);
    } else if (name === "varValue") {
      setVarValue(value);
    } else if (name === "entryCommand") {
      setEntryCommand(value);
    } else if (name === "port") {
      setPort(value);
    }
  };

  const handleEnvSubmit = () => {
    const projectID = app?.project_id;
    let updatePayload = {};
    if (port !== "" && port.toString() !== app.port.toString()) {
      updatePayload = { ...updatePayload, port: parseInt(port, 10) };
    }

    if (haveEnvVarsChanged(envVars, app?.env_vars)) {
      updatePayload = { ...updatePayload, env_vars: envVars };
    }

    // Remove keys with empty string values
    updatePayload = Object.entries(updatePayload).reduce(
      (acc, [key, value]) => {
        if (value !== "" && value !== null) {
          acc[key] = value;
        }
        return acc;
      },
      {}
    );
    //since command can be empty

    if (entryCommand !== app.command) {
      updatePayload = { ...updatePayload, command: entryCommand };
    }

    // Check if the payload is empty (no changes)
    if (Object.keys(updatePayload).length === 0) {
      setSubmitMessage("No changes to submit.");
    } else {
      // Proceed with the update operation
      dispatch(updateApp(appID, updatePayload))
        .then(() => {
          dispatch(clearUpdateAppState());
          setSubmitMessage("Update successful.");
          window.location.href = `/projects/${projectID}/apps/${appID}/settings`;
        })
        .catch((error) => {
          dispatch(clearUpdateAppState());
          console.error("Update failed:", error);
          setSubmitMessage("Update failed, please try again.");
        });
    }
  };

  const haveEnvVarsChanged = (newEnvVars, originalEnvVars) => {
    return Object.keys(newEnvVars).some(
      (key) => newEnvVars[key] !== (originalEnvVars?.[key] ?? undefined)
    );
  };

  const addEnvVar = () => {
    if (varName.trim() && varValue.trim()) {
      setEnvVars((prevEnvVars) => ({
        ...prevEnvVars,
        [varName.trim()]: varValue.trim(),
      }));
      setVarName("");
      setVarValue("");
    } else {
      setEnvError("Provide an environment variable key and value.");
    }
  };

  const removeExistingEnvVar = async (index) => {
    const projectID = app?.project_id;
    setLoadingIndex(index);
    const keyToRemove = Object.keys(envVars)[index];
    console.log(keyToRemove);

    if (keyToRemove !== null) {
      const updatePayload = { delete_env_vars: [keyToRemove] };

      await dispatch(updateApp(appID, updatePayload))
        .then(() => {
          dispatch(clearUpdateAppState());

          // update state with new env vars
          const newEnvVars = Object.keys(envVars).reduce((object, key) => {
            if (key !== keyToRemove) {
              object[key] = envVars[key];
            }
            return object;
          }, {});
          setEnvVars(newEnvVars);

          // retrieve updated application details here
          setSubmitMessage("Update successful.");
          dispatch(getSingleApp(appID));
          window.location.href = `/projects/${projectID}/apps/${appID}/settings`;
        })
        .catch((error) => {
          dispatch(clearUpdateAppState());
          console.error("Update failed:", error);
          setSubmitMessage("Update failed, please try again.");
        });
    }
  };

  const handleEnableButtonClick = async () => {
    setAppDisableProgress(true);
    setError("");

    try {
      const path = `/apps/${appID}/${app.disabled ? "enable" : "disable"}`;
      await handlePostRequestWithOutDataObject(appID, path);
      window.location.reload();
    } catch (error) {
      setError("Request failed, please try again later");
    } finally {
      setAppDisableProgress(false);
    }
  };

  const handleCIClick = () => {
    history.push(`/apps/${appID}/webhook`);
  };

  const handleAppName = (e) => {
    setConfirmAppname(e.target.value);
    if (openDeleteAlert && e.target.value === app.name) {
      setDisableDelete(false);
    } else if (openDeleteAlert && e.target.value !== app.name) {
      setDisableDelete(true);
    }
  };

  const handleDomainChange = (e) => {
    const { name, value } = e.target;

    if (name === "domainName") {
      setDomainName(value);
    }
  };

  const handleDomainSubmit = () => {
    const projectID = app.project_id;

    if (!domainName) {
      setSubmitMessage("Provide a domain name.");
      return;
    }

    let updatePayload = { ...{ custom_domain: domainName } };

    let error = validateDomain(domainName.toLowerCase());

    if (error) {
      setSubmitMessage(error);
      return;
    } else {
      if (Object.keys(updatePayload).length === 0) {
        setSubmitMessage("Provide a domain name.");
        return;
      } else {
        dispatch(updateApp(appID, updatePayload))
          .then(() => {
            dispatch(clearUpdateAppState());
            setSubmitMessage("Update successful.");
            window.location.href = `/projects/${projectID}/apps/${appID}/settings`;
          })
          .catch((error) => {
            dispatch(clearUpdateAppState());
            console.error("Update failed:", error);
            setSubmitMessage("Update failed, please try again.");
          });
      }
    }
  };

  const revertAppUrl = () => {
    const projectID = app.project_id;

    if (!app.has_custom_domain) {
      setSubmitMessage("Can't revert. Application has no custom domain.");
      return;
    }

    dispatch(revertUrl(appID))
      .then(() => {
        dispatch(clearUrlRevertState());
        setSubmitMessage("Application Url reverted successfully.");
        window.location.href = `/projects/${projectID}/apps/${appID}/settings`;
      })
      .catch((error) => {
        dispatch(clearUrlRevertState());
        console.error("Failed to revert url:", error);
        setSubmitMessage("Failed to revert url, please try again.");
      });
  };

  // Alerts
  const showDeleteAlert = () => {
    setOpenDeleteAlert(true);
  };
  const showDomainModal = () => {
    setDomainModal(true);
  };
  const showDisableModal = () => {
    setShowAppDisableModal(true);
  };
  const showAppRevisionModal = (revisionId) => {
    setRevisionId(revisionId);
    setRollBackConfirmationModal(true);
    setRevisingAppError("");
  };
  const hideAppRevisionModal = () => {
    setRollBackConfirmationModal(false);
  };

  // Toggles
  const togglePrivateImage = () => {
    setIsPrivateImage((prevIsPrivateImage) => !prevIsPrivateImage);
  };
  const toggleCustomDomain = () => {
    setIsCustomDomain((prevIsCustomDomain) => !prevIsCustomDomain);
  };
  const urlOnClick = () => {
    navigator.clipboard.writeText(app.url);
    setUrlChecked(true);
  };
  const internalUrlOnClick = () => {
    navigator.clipboard.writeText(app.internal_url);
    setInternalUrlChecked(true);
  };

  return (
    <DashboardLayout name={app?.name} header="Application Settings" short>
      <div className="SettingsContainer">
        {parentProject === "" && isRetrieving ? (
          <div className="NoResourcesMessage">
            <div className="SpinnerWrapper">
              <Spinner size="big" />
            </div>
          </div>
        ) : isFetched && !isRetrieving ? (
          <>
            <div className="AppPageLayout">
              <div className="APPSections">
                <div className="SectionTitle">Application Information</div>

                <div className="ApplicationTabsContainer">
                  <div className="ApplicationTabs">
                    {tabNames.map((tabName) => (
                      <TabItem
                        key={tabName}
                        tabName={tabName}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                      />
                    ))}
                  </div>
                  <div className="tab-content">
                    {activeTab === "General Details" && (
                      <GeneralDetailsTab
                        app={app}
                        parentProject={parentProject}
                      />
                    )}
                    {activeTab === "Image Settings" && (
                      <>
                        <ImageSettingsTab
                          app={app}
                          error={error}
                          newImage={newImage}
                          loading={isUpdating}
                          replicaOptions={replicaOptions}
                          isPrivateImage={isPrivateImage}
                          handleImageChange={handleImageChange}
                          togglePrivateImage={togglePrivateImage}
                          handleSelectReplicas={handleSelectReplicas}
                          handleImageSectionSubmit={handleImageSectionSubmit}
                          handleDockerCredentialsChange={(e) => {
                            handleDockerCredentialsChange(e);
                          }}
                        />
                      </>
                    )}
                    {activeTab === "Environment and Ports" && (
                      <EnvironmentAndPortsTab
                        app={app}
                        port={port}
                        error={error}
                        envVars={envVars}
                        varName={varName}
                        varValue={varValue}
                        envError={envError}
                        loading={isUpdating}
                        loadingIndex={loadingIndex}
                        addEnvVar={addEnvVar}
                        portError={portError}
                        entryCommand={entryCommand}
                        commandError={commandError}
                        handleEnvChange={handleEnvChange}
                        handleEnvSubmit={handleEnvSubmit}
                        removeExistingEnvVar={removeExistingEnvVar}
                        clearEnvError={() => setEnvError("")}
                        clearCommandError={() => {
                          setCommandError("");
                        }}
                        clearPortError={() => {
                          setPortError("");
                        }}
                      />
                    )}
                    {activeTab === "Domain and URLs" && (
                      <DomainAndUrlsTab
                        app={app}
                        updating={isUpdating}
                        reverting={isReverting}
                        urlOnClick={urlOnClick}
                        domainName={domainName}
                        urlChecked={urlChecked}
                        revertAppUrl={revertAppUrl}
                        loggedInUser={loggedInUser}
                        isCustomDomain={isCustomDomain}
                        showDomainModal={showDomainModal}
                        handleDomainChange={handleDomainChange}
                        handleDomainSubmit={handleDomainSubmit}
                        internalUrlChecked={internalUrlChecked}
                        toggleCustomDomain={toggleCustomDomain}
                        internalUrlOnClick={internalUrlOnClick}
                      />
                    )}
                  </div>
                </div>
              </div>

              {submitMessage && (
                <div className="SuccessMessageArea">
                  <Feedback type="success" message={submitMessage} />
                </div>
              )}

              <div className="APPSections">
                <div className="SectionTitle">Application Revisions</div>
                <div className={`AppRevisionsDetails BigCard`}>
                  {isFetching ? (
                    <div className="ResourceSpinnerWrapper">
                      <Spinner size="big" />
                    </div>
                  ) : (
                    <RevisionsList
                      revisions={revisions}
                      onRollbackClick={showAppRevisionModal}
                    />
                  )}
                </div>

                {pagination?.pages > 1 && (
                  <div className="AdminPaginationSection">
                    <Pagination
                      total={pagination.pages}
                      current={currentPage}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>

              <>
                <div className="SectionTitle">Manage Application</div>
                <div className="ProjectInstructions BigCard">
                  <div className="MemberBody">
                    <SettingsActionRow
                      title="Setup CI/CD"
                      content="Setup continuous integration for your application"
                      buttonLabel="Set up CI/CD"
                      buttonColor="primary"
                      onButtonClick={handleCIClick}
                    />
                    <SettingsActionRow
                      title={`${
                        app?.disabled ? "Enable" : "Disable"
                      } Application`}
                      content={
                        app?.disabled
                          ? "This will allow access to application and its resources"
                          : "This will temporarily disable your application and its resources"
                      }
                      buttonLabel={app?.disabled ? "Enable" : "Disable"}
                      buttonColor={app?.disabled ? "primary" : "red"}
                      onButtonClick={showDisableModal}
                    />
                    <SettingsActionRow
                      title="Delete Application"
                      content="This will permanently delete your application"
                      buttonLabel="Delete App"
                      buttonColor="red"
                      onButtonClick={showDeleteAlert}
                    />
                  </div>
                </div>
              </>

              {/* Rollback Modal */}
              <SettingsModal
                showModal={rollBackConfirmationModal}
                onClickAway={hideAppRevisionModal}
              >
                <RollbackConfirmationContent
                  onConfirm={() => rollbackApp(revisionId)}
                  onCancel={hideAppRevisionModal}
                  loading={revisingApp}
                  error={revisingAppError}
                />
              </SettingsModal>

              {/* Delete App Modal */}
              <SettingsModal
                showModal={openDeleteAlert}
                onClickAway={() => setOpenDeleteAlert(false)}
              >
                <DeleteAppContent
                  app={app}
                  verifiedName={ConfirmAppname}
                  handleAppName={handleAppName}
                  loading={isDeleting}
                  error={message}
                  disableDelete={disableDelete}
                  onConfirm={(e) => handleDeleteApp(e, appID)}
                  onCancel={() => setOpenDeleteAlert(false)}
                />
              </SettingsModal>

              {/* Disable App Modal */}
              <SettingsModal
                showModal={showAppDisableModal}
                onClickAway={() => setShowAppDisableModal(false)}
              >
                <DisableModalContent
                  item={{
                    name: app?.name,
                    disabled: app?.disabled,
                    type: "app",
                  }}
                  disableProgress={appDisableProgress}
                  handleDisableButtonClick={handleEnableButtonClick}
                  hideDisableAlert={() => setShowAppDisableModal(false)}
                  message={message}
                  isFailed={isFailed}
                />
              </SettingsModal>

              {/* Domain Instructions Modal */}
              <SettingsModal
                showModal={domainModal}
                onClickAway={() => setDomainModal(false)}
              >
                <DomainInstructionsContent
                  onClose={() => setDomainModal(false)}
                />
              </SettingsModal>
            </div>
          </>
        ) : (
          !isRetrieving &&
          !isFetched && (
            <div className="NoResourcesMessage">
              {errorMessage
                ? errorMessage
                : "Oops! Something went wrong! Failed to retrieve app information."}
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
};

export default AppSettingsPage;
