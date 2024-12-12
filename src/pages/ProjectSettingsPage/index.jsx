import React from "react";

import PrimaryButton from "../../components/PrimaryButton";
import {
  handleGetRequest,
  handlePostRequestWithOutDataObject,
  handlePatchRequest,
  handleDeleteRequest,
} from "../../apis/apis.js";
import Spinner from "../../components/Spinner";
import Avatar from "../../components/Avatar";
import Modal from "../../components/Modal";
import TextArea from "../../components/TextArea";
import Feedback from "../../components/Feedback";
import DeleteWarning from "../../components/DeleteWarning";
import BlackInputText from "../../components/BlackInputText";
import styles from "./ProjectSettingsPage.module.css";
// import "./ProjectSettingsPage.module.css";
import Select from "../../components/Select";
import { retrieveProjectTypes } from "../../helpers/projecttypes";
import { validateName } from "../../helpers/validation";
import { ReactComponent as CopyText } from "../../assets/images/copy.svg";
import { ReactComponent as Checked } from "../../assets/images/checked.svg";
import SettingsModal from "../../components/SettingsModal/index.jsx";
import DisableModalContent from "../../components/DisableModalContent/index.jsx";
import { ReactComponent as Bin } from "../../assets/images/bin.svg";
import { ReactComponent as Send } from "../../assets/images/send.svg";
import { retrieveMembershipRoles } from "../../helpers/membershipRoles";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import { namedOrganisations } from "../../helpers/projectOrganisations";
import SettingsActionRow from "../../components/SettingsActionRow/index.jsx";
import TagInput from "../../components/ProjectTagInput/index.jsx";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom/cjs/react-router-dom.min.js";

const ProjectSettingsPage = () => {
  const { data } = useSelector((state) => state.user);
  const { projectID } = useParams();
  const projectInfo = { ...JSON.parse(localStorage.getItem("project")) };
  const { name, description, organisation, project_type, age } = projectInfo;

  const [state, setState] = useState({
    openUpdateAlert: false,
    openRoleUpdateAlert: false,
    openDeleteAlert: false,
    openDropDown: false,
    projectName: name || "",
    projectID: projectID,
    projectDescription: description || "",
    projectAge: age || "",
    error: "",
    updatingProjectDetails: false,
    nameChecked: false,
    idChecked: false,
    tokenChecked: false,
    descriptionChecked: false,
    Confirmprojectname: "",
    disableDelete: true,
    projectOrganisation: organisation || "",
    projectType: project_type || "",
    othersBool: false,
    otherType: "",
    showInviteModel: false,
    role: "",
    email: "",
    removeMemberModal: false,
    isCurrentUserRemoved: false,
    projectUsers: [],
    fetchingProjectMembersError: "",
    projectUnregisteredUsers: [],
    fetchingProjectMembers: true,
    invitingMembers: false,
    invitingMembersError: "",
    updateMemberError: "",
    updatingMemberRole: false,
    removeMemberError: "",
    removingMember: false,
    currentUserIsAdminOrMember: false,
    currentUserIsAdminOrOwner: false,
    currentUserIsMemberOnly: false,
    deleteProjectError: "",
    deletingProject: false,
    disableProjectError: "",
    fetchingProjectDetails: false,
    disableProjectAlert: false,
    disableProjectProgress: false,
    projectDetails: [],
  });

  const [removedTags, setRemovedTags] = useState([]);
  const [newTags, setNewTags] = useState([]);

  useEffect(() => {
    getProjectMemberz();
    getProjectDetails();
  }, []);

  useEffect(() => {
    checkMembership();
  }, [state.projectUsers]);

  // componentDidMount() {
  //   this.getProjectMemberz();
  //   this.getProjectDetails();
  // }

  const disableProjectAlertFunc = (disableBool) => {
    setState((prevState) => ({
      ...prevState,
      disableProjectAlert: disableBool,
      disableProjectError: "",
    }));
  };

  const checkMembership = () => {
    const { projectUsers } = state;
    const result = projectUsers?.filter((item) => item.user?.id === data.id);
    //either member or admin
    if (
      result[0]?.role === "RolesList.member" ||
      result[0]?.role === "RolesList.admin"
    ) {
      setState((prevState) => ({
        ...prevState,
        currentUserIsAdminOrMember: true,
      }));
    }
    //either owner or admin
    if (
      result[0]?.role === "RolesList.owner" ||
      result[0]?.role === "RolesList.admin"
    ) {
      setState((prevState) => ({
        ...prevState,
        currentUserIsAdminOrOwner: true,
      }));
    }
    if (result[0]?.role === "RolesList.member") {
      setState((prevState) => ({
        ...prevState,
        currentUserIsMemberOnly: true,
      }));
    }
  };

  const getProjectMemberz = () => {
    handleGetRequest(`/projects/${projectID}/users`)
      .then((response) => {
        setState((prevState) => ({
          ...prevState,
          projectUsers: response.data.data.project_users,
          projectUnregisteredUsers: response.data.data.project_anonymous_users,
          fetchingProjectMembers: false,
        }));
        checkMembership();
      })
      .catch((error) => {
        setState((prevState) => ({
          ...prevState,
          fetchingProjectMembersError: "Failed to fetch project members",
          fetchingProjectMembers: false,
        }));
      });
  };

  const inviteMember = () => {
    const { email, role } = state;
    setState((prevState) => ({
      ...prevState,
      invitingMembers: true,
    }));
    handlePostRequestWithOutDataObject(
      { email: email, role: role },
      `/projects/${projectID}/users`
    )
      .then(() => {
        //page reset also resets loader
        window.location.href = `/projects/${projectID}/settings`;
      })
      .catch((error) => {
        setState((prevState) => ({
          ...prevState,
          invitingMembersError: "Failed to invite user",
          invitingMembers: false,
        }));
      });
  };

  const updateMemberRoles = () => {
    const { email, role } = state;
    setState((prevState) => ({
      ...prevState,
      updatingMemberRole: true,
    }));
    handlePatchRequest(`/projects/${projectID}/users`, {
      email,
      role,
    })
      .then(() => {
        window.location.href = `/projects/${projectID}/settings`;
      })
      .catch((error) => {
        setState((prevState) => ({
          ...prevState,
          updateMemberError: "Failed to update user",
          updatingMemberRole: false,
        }));
      });
  };

  const removeMember = (email) => {
    const data = { data: email };
    setState((prevState) => ({
      ...prevState,
      removingMember: true,
    }));
    handleDeleteRequest(`/projects/${projectID}/users`, data)
      .then(() => {
        window.location.href = `/projects/${projectID}/settings`;
      })
      .catch(() => {
        setState((prevState) => ({
          ...prevState,
          removeMemberError: "Failed to remove user",
          removingMember: false,
        }));
      });
  };

  const hideDeleteAlert = () => {
    setState((prevState) => ({
      ...prevState,
      openDeleteAlert: false,
    }));
  };

  const showRemoveMemberModal = (email) => {
    setState((prevState) => ({
      ...prevState,
      removeMemberModal: true,
      removeMemberError: "",
      email: email,
    }));
  };

  const closeRemoveMemberModal = () => {
    setState((prevState) => ({
      ...prevState,
      removeMemberModal: false,
    }));
  };

  const removeProjectMember = (e) => {
    e.preventDefault();
    const { email } = state;
    const emailDetails = {
      email: email,
    };
    removeMember(emailDetails);
    if (email === data.email) {
      setState((prevState) => ({
        ...prevState,
        isCurrentUserRemoved: true,
      }));
    }
  };

  const handleMemberInvitation = (e) => {
    e.preventDefault();
    const { email, role } = state;
    if (email !== "" && role !== "") {
      validateEmail(email);
      inviteMember();
    }
  };

  const handleMemberRoleUpdate = (e) => {
    e.preventDefault();
    const { email, role } = state;
    if (email !== "" && role !== "") {
      validateEmail(email);
      updateMemberRoles();
    }
  };

  const validateEmail = (email) => {
    const emailRegEx =
      // eslint-disable-next-line no-useless-escape
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegEx.test(String(email).toLowerCase());
  };

  const handleChange = (e) => {
    const { error, openDeleteAlert } = state;
    const projectInfo = { ...JSON.parse(localStorage.getItem("project")) };
    const { name } = projectInfo;

    setState((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
    if (error) {
      setState((prevState) => ({
        ...prevState,
        error: "",
      }));
    }

    if (e.target.value === name && openDeleteAlert) {
      setState((prevState) => ({
        ...prevState,
        disableDelete: false,
      }));
    } else if (e.target.value !== name && openDeleteAlert) {
      setState((prevState) => ({
        ...prevState,
        disableDelete: true,
      }));
    }
  };

  const showInviteMenu = () => {
    setState((prevState) => ({
      ...prevState,
      showInviteModel: true,
      invitingMembersError: "",
    }));
  };

  const hideInviteMenu = () => {
    setState((prevState) => ({
      ...prevState,
      showInviteModel: false,
    }));
  };
  const updateProjectDetails = (projectID, data) => {
    setState((prevState) => ({
      ...prevState,
      updatingProjectDetails: true,
    }));
    handlePatchRequest(`/projects/${projectID}`, data)
      .then(() => {
        window.location.href = `/projects`;
      })
      .catch((error) => {
        setState((prevState) => ({
          ...prevState,
          error: "Failed to update project",
          updatingProjectDetails: false,
        }));
      });
  };

  const handleSubmit = () => {
    const {
      projectName,
      projectDescription,
      projectOrganisation,
      projectType,
      otherType,
      othersBool,
    } = state;

    const projectInfo = JSON.parse(localStorage.getItem("project")) || {};
    const { name, description, organisation, project_type } = projectInfo;

    const trim = (input) => input.trim();
    const capitalizeFirstLetter = (input) =>
      input.charAt(0).toUpperCase() + input.slice(1);

    const trimmedProjectName = trim(projectName);
    const trimmedProjectDescription = trim(projectDescription);
    const trimmedProjectOrganisation = trim(projectOrganisation);
    const trimmedProjectType = trim(
      capitalizeFirstLetter(othersBool ? otherType : projectType)
    );

    const hasEmptyField =
      !trimmedProjectName ||
      !trimmedProjectDescription ||
      !trimmedProjectOrganisation ||
      !trimmedProjectType ||
      (removedTags.length === 0 && newTags.length === 0);

    if (hasEmptyField) {
      setState((prevState) => ({
        ...prevState,
        error:
          "Can't update when an empty field is submitted. Please fill the missing field or leave it unchanged.",
      }));
      return;
    }

    const newProject = {};

    if (trimmedProjectName !== name) {
      newProject.name = trimmedProjectName;
    }
    if (trimmedProjectDescription !== description) {
      newProject.description = trimmedProjectDescription;
    }
    if (trimmedProjectOrganisation !== organisation) {
      newProject.organisation = trimmedProjectOrganisation;
    }
    if (trimmedProjectType !== project_type) {
      newProject.project_type = trimmedProjectType;
    }
    if (removedTags.length > 0) {
      newProject.tags_remove = removedTags;
    }
    if (newTags.length > 0) {
      newProject.tags_add = newTags;
    }

    if (Object.keys(newProject).length === 0) {
      setState((prevState) => ({
        ...prevState,
        error: "Please provide new information in at least one of the fields",
      }));
      return;
    }

    const nameCheckResult = checkProjectInputValidity(
      trimmedProjectName,
      "name"
    );
    const organisationCheckResult = checkProjectInputValidity(
      trimmedProjectOrganisation,
      "organisation"
    );
    const typeCheckResult = checkProjectInputValidity(
      trimmedProjectType,
      "type"
    );

    if (nameCheckResult) {
      setState((prevState) => ({ ...prevState, error: nameCheckResult }));
      return;
    }
    if (organisationCheckResult) {
      setState((prevState) => ({
        ...prevState,
        error: organisationCheckResult,
      }));
      return;
    }
    if (typeCheckResult) {
      setState((prevState) => ({ ...prevState, error: typeCheckResult }));
      return;
    }

    updateProjectDetails(projectID, newProject);
  };

  const nameOnClick = (e) => {
    const projectInfo = { ...JSON.parse(localStorage.getItem("project")) };
    const { name } = projectInfo;
    navigator.clipboard.writeText(name);
    setState((prevState) => ({
      ...prevState,
      nameChecked: true,
    }));
    e.preventDefault();
  };

  const deleteThisProject = (projectID) => {
    setState((prevState) => ({
      ...prevState,
      deletingProject: true,
      deleteProjectError: "",
    }));
    handleDeleteRequest(`/projects/${projectID}`, {})
      .then(() => {
        window.location.href = `/projects`;
      })
      .catch(() => {
        setState((prevState) => ({
          ...prevState,
          deleteProjectError: "Failed to delete this project",
          deletingProject: false,
        }));
      });
  };

  const handleDeleteProject = (e, projectID) => {
    e.preventDefault();
    deleteThisProject(projectID);
  };
  const getProjectDetails = () => {
    handleGetRequest(`/projects/${projectID}`)
      .then((response) => {
        setState((prevState) => ({
          ...prevState,
          projectDetails: response.data.data.project,
          fetchingProjectDetails: false,
        }));
      })
      .catch((error) => {
        setState((prevState) => ({
          ...prevState,
          error: "Failed to fetch project details",
          fetchingProjectDetails: false,
        }));
      });
  };

  const handleEnableButtonClick = () => {
    let { projectDetails } = state;
    setState((prevState) => ({
      ...prevState,
      disableProjectProgress: true,
    }));
    try {
      if (projectDetails.disabled) {
        handlePostRequestWithOutDataObject({}, `/projects/${projectID}/enable`)
          .then(() => {
            window.location.reload();
          })
          .catch((error) => {
            setState((prevState) => ({
              ...prevState,
              disableProjectError:
                "Failed to complete this action. Please try again later",
            }));
          });
      } else {
        handlePostRequestWithOutDataObject({}, `/projects/${projectID}/disable`)
          .then(() => {
            window.location.reload();
          })
          .catch((error) => {
            setState((prevState) => ({
              ...prevState,
              disableProjectError:
                "Failed to complete this action. Please try again later",
              disableProjectProgress: false,
            }));
          });
      }
    } catch (error) {
      //console.error("API call error:", error);
      setState((prevState) => ({
        ...prevState,
        disableProjectError:
          "Failed to complete this action. Please try again later",
        disableProjectProgress: false,
      }));
    }
  };

  const showUpdateAlert = () => {
    setState((prevState) => ({
      ...prevState,
      openUpdateAlert: true,
    }));
  };

  const updateRoleAlert = (email) => {
    setState((prevState) => ({
      ...prevState,
      openRoleUpdateAlert: true,
      email: email,
    }));
  };

  const showDeleteAlert = () => {
    setState((prevState) => ({
      ...prevState,
      openDeleteAlert: true,
    }));
  };
  const checkProjectInputValidity = (input, output) => {
    if (!validateName(input)) {
      return `${output} should start with a letter`;
    } else if (validateName(input) === "false_convention") {
      return `${output} may only contain letters and a hypen -`;
    } else if (input.length > 22) {
      return `Project ${output} cannot exceed 22 characters`;
    } else {
      return "";
    }
  };

  const hideUpdateAlert = () => {
    setState((prevState) => ({
      ...prevState,
      openUpdateAlert: false,
    }));
  };

  const hideRoleUpdateAlert = () => {
    {
      setState((prevState) => ({
        ...prevState,
        openRoleUpdateAlert: false,
      }));
    }
  };

  const handleTypeSelectChange = (selected) => {
    const { othersBool } = state;
    if (selected.id === 6) {
      if (!othersBool) {
        setState((prevState) => ({
          ...prevState,
          othersBool: true,
        }));
      }
    } else {
      setState((prevState) => ({
        ...prevState,
        projectType: selected.value,
      }));
      if (othersBool) {
        setState((prevState) => ({
          ...prevState,
          othersBool: false,
        }));
      }
    }
  };
  const handleInvitationRole = (selected) => {
    setState((prevState) => ({
      ...prevState,
      role: selected.value,
    }));
  };

  const handleOrganisationSelectChange = (selected) => {
    setState((prevState) => ({
      ...prevState,
      projectOrganisation: selected.value,
    }));
  };

  const updateRoleValue = (string) => {
    let role = string[1];
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const onTagsChange = (tags) => {
    if (state?.projectDetails?.tags) {
      const oldTagNames = state?.projectDetails?.tags?.map((tag) => tag.name);
      const removed = oldTagNames.filter((tag) => !tags.includes(tag));
      setRemovedTags(removed);
      setNewTags(tags);
    }
  };

  let currentUserEmail = data.email;

  const {
    openUpdateAlert,
    openDeleteAlert,
    openRoleUpdateAlert,
    projectName,
    projectDescription,
    projectAge,
    error,
    Confirmprojectname,
    disableDelete,
    projectOrganisation,
    projectType,
    othersBool,
    otherType,
    nameChecked,
    // idChecked,
    // descriptionChecked,
    showInviteModel,
    email,
    role,
    currentUserIsAdminOrMember,
    removeMemberModal,
    projectUsers,
    projectUnregisteredUsers,
    currentUserIsAdminOrOwner,
    currentUserIsMemberOnly,
    fetchingProjectMembers,
    invitingMembers,
    invitingMembersError,
    updateMemberError,
    updatingMemberRole,
    removingMember,
    removeMemberError,
    updatingProjectDetails,
    deletingProject,
    deleteProjectError,
    disableProjectError,
    disableProjectAlert,
    disableProjectProgress,
  } = state;
  const types = retrieveProjectTypes();
  const roles = retrieveMembershipRoles();

  const presetOrganisations = namedOrganisations();

  return (
    <DashboardLayout name={name} header="Project Settings" short>
      <div className="SectionTitle">Project Details</div>
      <div className={`ProjectInstructions BigCard`}>
        <div className={`${styles.ProjectsDetailsInnerSection}`}>
          <div className={styles.InnerContentGrid}>
            <div className={`${styles.SectionSubTitle}`}>Project Name</div>
            <div className={styles.ProjectButtonRow}>
              <div className={`${styles.SettingsSectionInfo}`}>
                <div>{projectName}</div>
              </div>
              <div className={styles.CopyIcon}>
                <CopyText onClick={nameOnClick} />
                {nameChecked ? <Checked /> : null}
              </div>
            </div>
            <div>
              <div className={`${styles.SectionSubTitle}`}>
                Project Description
              </div>
              <div className={styles.ProjectButtonRow}>
                <div className={styles.SettingsSectionInfo}>
                  <div>{projectDescription}</div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.InnerContentGrid}>
            <div>
              <div className={`${styles.SectionSubTitle}`}>Organization</div>
              <div className={styles.ProjectButtonRow}>
                <div className={styles.SettingsSectionInfo}>
                  <div>{projectOrganisation}</div>
                </div>
              </div>
            </div>
            <div>
              <div className={`${styles.SectionSubTitle}`}>Age</div>
              <div className={styles.ProjectButtonRow}>
                <div className={styles.SettingsSectionInfo}>
                  <div>{projectAge}</div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.InnerContentGrid}>
            <div>
              <div className={`${styles.SectionSubTitle}`}>Project Type</div>
              <div className={styles.ProjectButtonRow}>
                <div className={styles.SettingsSectionInfo}>
                  <div>{projectType}</div>
                </div>
              </div>
            </div>
            <div>
              <div className={`${styles.SectionSubTitle}`}>Status</div>
              <div className={styles.ProjectButtonRow}>
                <div className={styles.SettingsSectionInfo}>
                  <div>
                    {state.projectDetails?.disabled === true ? (
                      <span style={{ color: "red" }}>Disabled</span>
                    ) : (
                      "Enabled"
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`SectionTitle`}>Membership</div>
      <div className={"ProjectInstructions BigCard"}>
        {fetchingProjectMembers ? (
          <Spinner />
        ) : (
          <>
            <div className={styles.MembershipHeader}>
              <div className={styles.MemberSection}>
                <div className={styles.SettingsSectionInfoHeader}>
                  {projectUsers?.length === 1 ? (
                    <div className="SectionSubTitle">
                      Project has 1 Team Member
                    </div>
                  ) : (
                    <div>Project has {projectUsers?.length} Team Members</div>
                  )}
                </div>
                <div className="SubText" style={{ maxWidth: "90%" }}>
                  Members that have accounts on crane cloud can perform
                  different operations on the project depending on their
                  permission.
                </div>
              </div>
              {currentUserIsAdminOrOwner && (
                <PrimaryButton
                  // className={styles.SettingsButton}
                  color="primary"
                  onClick={() => {
                    showInviteMenu();
                  }}
                >
                  Invite member
                </PrimaryButton>
              )}
            </div>
            <div className={styles.MemberTable}>
              <div className={styles.MemberBody}>
                {projectUsers?.map((entry, index) => (
                  <div className={styles.MemberTableRow} key={index}>
                    <div className={styles.MemberInfo}>
                      <Avatar
                        name={entry.user.name}
                        className={styles.MemberAvatar}
                      />
                      <div className={styles.MemberNameEmail}>
                        <div className={styles.UserHeader}>
                          {entry.user.name}
                        </div>
                        <div className={styles.Wrap}>{entry.user.email}</div>
                      </div>
                    </div>
                    {entry.role !== "RolesList.owner" &&
                      entry.accepted_collaboration_invite === false && (
                        <div className="SubText">Pending Invitation</div>
                      )}
                    <div className={styles.MemberOptions}>
                      <div
                        className={styles.MemberRole}
                        onClick={() => {
                          !currentUserIsMemberOnly &&
                            updateRoleAlert(entry.user.email);
                        }}
                        title="Change Role"
                      >
                        <span>Role:</span>
                        {updateRoleValue(entry.role.split("."))}
                      </div>
                      <div>
                        {entry.user.email === currentUserEmail
                          ? entry.role !== "RolesList.owner" && (
                              <PrimaryButton
                                small
                                noPadding
                                transparent
                                onClick={() => {
                                  showRemoveMemberModal(entry.user.email);
                                }}
                              >
                                Leave
                              </PrimaryButton>
                            )
                          : currentUserIsAdminOrOwner && (
                              <PrimaryButton
                                small
                                noPadding
                                transparent
                                onClick={() => {
                                  showRemoveMemberModal(entry.user.email);
                                }}
                              >
                                Remove
                              </PrimaryButton>
                            )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {projectUnregisteredUsers.length > 0 && (
              <div className={styles.LowerSection}>
                <div className={styles.SettingsSectionInfoHeader}>
                  Unregistered Members
                </div>
                <div className="SubText">
                  Members invited to this project by email but have no crane
                  cloud accounts.
                </div>

                <div className={styles.MemberTable}>
                  <div className={styles.MemberBody}>
                    {projectUnregisteredUsers?.map((entry, index) => (
                      <div className={styles.MemberTableRow} key={index}>
                        <div className={styles.MemberTableCell}>
                          <div className={styles.NameSecting}>
                            {
                              <Avatar
                                name={entry.email}
                                className={styles.MemberAvatar}
                              />
                            }
                            {/* <div className={styles.MemberNameEmail}> */}
                            <div className={styles.Wrap}>{entry.email}</div>

                            {/* </div> */}
                          </div>
                        </div>
                        <div className={styles.MemberActionArea}>
                          <div className={styles.MemberTableCell}>
                            <div className={styles.MemberRole}>
                              <span>Role:</span>
                              {entry.role}
                            </div>
                          </div>

                          <div className={styles.OptionButtons}>
                            <Send
                              className={styles.SendButton}
                              title="Resend Invite"
                            />
                            <Bin
                              className={styles.BinButton}
                              onClick={() => {
                                showRemoveMemberModal(entry.email);
                              }}
                              title="Delete Invite"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {openRoleUpdateAlert && (
        <div className={styles.ProjectDeleteModel}>
          <Modal
            showModal={openRoleUpdateAlert}
            onClickAway={hideRoleUpdateAlert}
          >
            <div>
              <div className={styles.ModelHeader}>Change Member Role</div>
              <div className={styles.UpdateForm}>
                <div className={styles.UpdateInputSection}>
                  <div className={styles.DeleteDescription}>
                    Search member (by email)
                  </div>
                  <BlackInputText
                    placeholder="Enter email here"
                    name="email"
                    value={email}
                    // should not be editable
                    // onChange={(e) => {
                    //   this.handleChange(e);
                    // }}
                  />
                </div>
                <div className={styles.UpdateInputSection}>
                  <div className={styles.DeleteDescription}>
                    Member Role (in connection with user permission)
                  </div>
                  <Select
                    required
                    placeholder={role ? role : "Choose membership role"}
                    options={roles}
                    onChange={handleInvitationRole}
                  />
                </div>
                {updateMemberError && (
                  <Feedback message={updateMemberError} type="error" />
                )}
                <div className={styles.SendInvitationButton}>
                  <PrimaryButton
                    onClick={handleMemberRoleUpdate}
                    color="primary"
                  >
                    {updatingMemberRole ? <Spinner /> : "Update Role"}
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </Modal>
        </div>
      )}
      {currentUserIsAdminOrMember === false ? (
        <>
          <div className="SectionTitle">Manage Project</div>
          <div className="ProjectInstructions BigCard">
            <div className="MemberBody">
              <SettingsActionRow
                title="Update Project"
                content="Modify the project name and description"
                buttonLabel="Update"
                disabled={fetchingProjectMembers}
                onButtonClick={showUpdateAlert}
                buttonColor="primary"
              />

              <SettingsActionRow
                title={`${
                  state.projectDetails?.disabled ? "Enable" : "Disable"
                } project
                  `}
                content={
                  state.projectDetails?.disabled
                    ? "Allow access to project resources and enable billing"
                    : "Prevent project from being billed by blocking access to it's resources."
                }
                buttonLabel={
                  state.projectDetails?.disabled ? "Enable" : "Disable"
                }
                buttonColor={state.projectDetails?.disabled ? "primary" : "red"}
                onButtonClick={() => {
                  disableProjectAlertFunc(true);
                }}
              />

              <SettingsActionRow
                title="Delete Project"
                content="Take down your entire project, delete all apps under it."
                buttonLabel="Delete"
                buttonColor="red"
                onButtonClick={showDeleteAlert}
              />
            </div>
          </div>
        </>
      ) : null}

      {openUpdateAlert && (
        <div className={styles.ProjectDeleteModel}>
          <Modal showModal={openUpdateAlert} onClickAway={hideUpdateAlert}>
            <div>
              <div
                onSubmit={(e) => {
                  handleSubmit();
                  e.preventDefault();
                }}
              >
                <div className={styles.UpdateForm}>
                  <div className={styles.UpdateInputSection}>
                    <div className={styles.DeleteDescription}>Project name</div>
                    <BlackInputText
                      placeholder="Project Name"
                      name="projectName"
                      value={projectName}
                      onChange={(e) => {
                        handleChange(e);
                      }}
                    />
                  </div>
                  <div className={styles.UpdateInputSection}>
                    <div className={styles.DeleteDescription}>Organisation</div>
                    <Select
                      required
                      placeholder={
                        projectOrganisation
                          ? projectOrganisation
                          : "Update project Organization"
                      }
                      options={presetOrganisations}
                      onChange={handleOrganisationSelectChange}
                    />
                    {othersBool && (
                      <BlackInputText
                        placeholder="Organisation"
                        name="projectOrganisation"
                        value={projectOrganisation}
                        onChange={(e) => {
                          handleChange(e);
                        }}
                      />
                    )}
                  </div>
                  <div className={styles.UpdateInputSection}>
                    <div className={styles.DeleteDescription}>Project type</div>
                    <Select
                      required
                      placeholder={
                        projectType ? projectType : "Update project type"
                      }
                      options={types}
                      onChange={handleTypeSelectChange}
                    />
                    {othersBool && (
                      <BlackInputText
                        required
                        placeholder="Type of project"
                        name="otherType"
                        value={otherType}
                        onChange={(e) => {
                          handleChange(e);
                        }}
                      />
                    )}
                  </div>
                  <div className={styles.UpdateInputSection}>
                    <div className={styles.DeleteDescription}>Project tags</div>
                    <div className={styles.ProjectInputTag}>
                      <TagInput
                        userTags={
                          state?.projectDetails?.tags
                            ? state?.projectDetails?.tags?.map(
                                (tag) => tag.name
                              )
                            : []
                        }
                        onTagsChange={onTagsChange}
                      />
                    </div>
                  </div>
                  <div className={styles.UpdateInputSection}>
                    <div className={styles.DeleteDescription}>
                      Project description
                    </div>
                    <TextArea
                      placeholder="Description"
                      name="projectDescription"
                      style={styles.TextArea}
                      value={projectDescription}
                      onChange={(e) => {
                        handleChange(e);
                      }}
                    />
                  </div>
                  {error && (
                    <Feedback
                      type="error"
                      message={"Failed to update Project"}
                    />
                  )}
                  <div className={styles.UpdateProjectModelButtons}>
                    <PrimaryButton
                      className="CancelBtn"
                      onClick={hideUpdateAlert}
                    >
                      Cancel
                    </PrimaryButton>
                    <PrimaryButton onClick={handleSubmit} color="primary">
                      {updatingProjectDetails ? <Spinner /> : "update project"}
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        </div>
      )}
      {showInviteModel === true && (
        <div className={styles.ProjectDeleteModel}>
          <Modal showModal={showInviteModel} onClickAway={hideInviteMenu}>
            <div>
              <div className={styles.ModelHeader}>Invite Member </div>
              <div className={styles.UpdateForm}>
                <div className={styles.UpdateInputSection}>
                  <div className={styles.DeleteDescription}>
                    Search member (by email)
                  </div>
                  <BlackInputText
                    placeholder="Enter email here"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      handleChange(e);
                    }}
                  />
                </div>
                <div className={styles.UpdateInputSection}>
                  <div className={styles.DeleteDescription}>
                    Member Role (in connection with user permission)
                  </div>
                  <Select
                    required
                    placeholder={role ? role : "Choose membership role"}
                    options={roles}
                    onChange={handleInvitationRole}
                  />
                </div>
                {invitingMembersError && (
                  <Feedback type="error" message={invitingMembersError} />
                )}
                <div className={styles.SendInvitationButton}>
                  <PrimaryButton
                    color="primary"
                    onClick={handleMemberInvitation}
                  >
                    {invitingMembers ? <Spinner /> : "Send Invitation"}
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </Modal>
        </div>
      )}
      {openDeleteAlert && (
        <div className={styles.ProjectDeleteModel}>
          <Modal showModal={openDeleteAlert} onClickAway={hideDeleteAlert}>
            <div className={styles.DeleteProjectModel}>
              <div className={styles.DeleteProjectModalUpperSection}>
                <div className={styles.WarningContainer}>
                  <div className={styles.DeleteDescription}>
                    Are you sure you want to delete&nbsp;
                    <span>{name}</span>
                    &nbsp;?
                  </div>
                  <div className={styles.DeleteSubDescription}>
                    This will permanently delete the project and all its
                    resources.
                    <br />
                    <br />
                    Please confirm by typing &nbsp;
                    <b className={styles.DeleteWarning}>{name}</b> &nbsp; below.
                  </div>
                  <div className={styles.InnerModalDescription}>
                    <BlackInputText
                      required
                      placeholder={name}
                      name="Confirmprojectname"
                      value={Confirmprojectname}
                      onChange={(e) => {
                        handleChange(e);
                      }}
                    />
                    <DeleteWarning textAlignment="Left" />
                  </div>
                </div>
              </div>
              <div className={styles.DeleteProjectModalLowerSection}>
                <div className={styles.DeleteProjectModelButtons}>
                  <PrimaryButton
                    className="CancelBtn"
                    onClick={hideDeleteAlert}
                  >
                    Cancel
                  </PrimaryButton>
                  <button
                    className={
                      disableDelete ? styles.InactiveDelete : styles.DeleteBtn
                    }
                    disabled={disableDelete}
                    onClick={(e) => handleDeleteProject(e, projectID)}
                  >
                    {deletingProject ? <Spinner /> : "Delete"}
                  </button>
                </div>

                {deleteProjectError && (
                  <Feedback message={deleteProjectError} type="error" />
                )}
              </div>
            </div>
          </Modal>
        </div>
      )}

      <Modal showModal={removeMemberModal} onClickAway={closeRemoveMemberModal}>
        <div className={styles.DeleteProjectModel}>
          <div className={styles.DeleteProjectModalUpperSection}>
            <div className={styles.WarningContainer}>
              <div className={styles.DeleteDescription}>
                {currentUserEmail === email ? (
                  <>Are you sure you want to remove yourself?</>
                ) : (
                  <>
                    Are you sure you want to remove the member with
                    <br /> email: {email}?
                  </>
                )}
              </div>
            </div>
          </div>
          <div className={styles.DeleteProjectModalLowerSection}>
            <div className={styles.DeleteProjectModelButtons}>
              <PrimaryButton
                type="button"
                className="CancelBtn"
                onClick={closeRemoveMemberModal}
              >
                Cancel
              </PrimaryButton>
              <PrimaryButton
                type="button"
                color="red"
                onClick={(e) => removeProjectMember(e)}
              >
                {removingMember ? <Spinner /> : "Confirm"}
              </PrimaryButton>
            </div>
          </div>
          {removeMemberError && (
            <Feedback type="error" message={"Failed to remove member"} />
          )}
        </div>
      </Modal>
      {disableProjectAlert && (
        <SettingsModal
          showModal={disableProjectAlert}
          onClickAway={() => {
            disableProjectAlertFunc(false);
          }}
        >
          <DisableModalContent
            item={{
              name: projectName,
              type: "project",
              disabled: state.projectDetails?.disabled,
            }}
            disableProgress={disableProjectProgress}
            handleDisableButtonClick={() => {
              handleEnableButtonClick();
            }}
            hideDisableAlert={() => {
              disableProjectAlertFunc(false);
            }}
            message={disableProjectError}
            isFailed={disableProjectError ? true : false}
          />
        </SettingsModal>
      )}
    </DashboardLayout>
  );
};

export default ProjectSettingsPage;
