import React, { useState, useEffect, useCallback } from "react";
import Modal from "../../components/Modal";
import styles from "./UserProjectsPage.module.css";
import InformationBar from "../../components/InformationBar";
import { ReactComponent as ButtonPlus } from "../../assets/images/buttonplus.svg";
import Header from "../../components/Header";
import Pagination from "../../components/Pagination";
import CreateProject from "../../components/CreateProject";
import getUserProjects from "../../redux/actions/projectsList";
import ProjectCard from "../../components/ProjectCard";
import PrimaryButton from "../../components/PrimaryButton";
import Spinner from "../../components/Spinner";
import { handlePatchRequest } from "../../apis/apis.js";
import "../../index.css";
import { Link } from "react-router-dom/cjs/react-router-dom.min.js";
import { useProjects } from "../../hooks/useProjects.js";
import { useSelector } from "react-redux";

const UserProjectsPage = () => {
  const { data: user } = useSelector((state) => state.user);

  const [openCreateComponent, setOpenCreateComponent] = useState(false);
  const [searchword, setSearchword] = useState("");
  const [showInviteModel, setShowInviteModel] = useState(false);
  const [inviteeProjectId, setInviteeProjectId] = useState("");
  const [inviteeModelRole, setInviteeModelRole] = useState("");
  const [decliningInvitation, setDecliningInvitation] = useState(false);
  const [acceptingInvitation, setAcceptingInvitation] = useState(false);
  const [invitationError, setInvitationError] = useState("");
  const [currentPaginationPage, setCurrentPaginationPage] = useState(1);

  const {
    data: projectsData,
    isLoading,
    isError,
    isFetched,
  } = useProjects(currentPaginationPage, searchword);

  useEffect(() => {
    if (searchword) {
      searchThroughProjects();
    }
  }, [searchword]);

  const openProjectCreateComponent = () => {
    setOpenCreateComponent(true);
  };
  const callbackProjectCreateComponent = useCallback(() => {
    setOpenCreateComponent(false);
  }, []);

  const searchThroughProjects = () => {
    setCurrentPaginationPage(1);
    getUserProjects(1, searchword);
  };

  const hideInvitationModel = () => {
    setShowInviteModel(false);
  };

  const showInvitationModel = (inviteeProjectId, inviteeModelRole) => {
    setShowInviteModel(true);
    setInviteeProjectId(inviteeProjectId);
    setInviteeModelRole(inviteeModelRole);
  };

  const handleInvitationDecline = () => {
    setDecliningInvitation(true);
    handlePatchRequest(`/projects/${inviteeProjectId}/users/handle_invite`, {
      accepted_collaboration_invite: false,
    })
      .then(() => {
        setDecliningInvitation(false);
        setShowInviteModel(false);
        getUserProjects(currentPaginationPage);
      })
      .catch(() => {
        setInvitationError("Something went wrong");
        setDecliningInvitation(false);
        setShowInviteModel(false);
      });
  };

  const handleInvitationAcceptence = () => {
    setAcceptingInvitation(true);
    handlePatchRequest(`/projects/${inviteeProjectId}/users/handle_invite`, {
      accepted_collaboration_invite: true,
    })
      .then(() => {
        setAcceptingInvitation(false);
        setShowInviteModel(false);
        getUserProjects(currentPaginationPage);
      })
      .catch(() => {
        setInvitationError("Something went wrong");
        setAcceptingInvitation(false);
        setShowInviteModel(false);
      });
  };

  const onPageChange = (page) => {
    setCurrentPaginationPage(page);
  };

  return (
    <div className={styles.Page}>
      {openCreateComponent ? (
        <CreateProject closeComponent={callbackProjectCreateComponent} />
      ) : (
        <div>
          <div className={styles.TopRow}>
            <Header />
            <InformationBar
              header={
                <span>
                  <Link className="breadcrumb" to={`/dashboard`}>
                    Dashboard
                  </Link>
                  / Projects
                </span>
              }
              showBtn
              buttontext="+ New Project"
              showSearchBar
              placeholder="Search through projects"
              btnAction={openProjectCreateComponent}
              searchAction={setSearchword}
              adminRoute={user?.username === "admin"}
            />
          </div>
          <div className={styles.MainRow}>
            <div className={`${styles.SelectProjects} SmallContainer`}></div>
            {isLoading ? (
              <div className={styles.NoResourcesMessage}>
                <div className={styles.SpinnerWrapper}>
                  <Spinner size="big" />
                </div>
              </div>
            ) : searchword !== "" ? (
              <div className={`${styles.ProjectList}  SmallContainer`}>
                {isFetched &&
                  projectsData.data?.data?.projects !== undefined &&
                  projectsData.data?.data?.projects?.map((project) => (
                    <ProjectCard
                      key={project.id}
                      name={project.name}
                      description={project.description}
                      cardID={project.id}
                      acceptInviteCallBackModel={showInvitationModel}
                      userID={user.id}
                      ownerId={project.owner_id}
                      apps_count={project.apps_count}
                      followers_count={project.followers_count}
                      disabled={project.disabled}
                      admin_disabled={project.admin_disabled}
                    />
                  ))}
              </div>
            ) : (
              <div className={`${styles.ProjectList}  SmallContainer`}>
                {isFetched &&
                  projectsData.data?.data?.projects !== undefined &&
                  projectsData.data?.data?.projects?.map((project) => (
                    <ProjectCard
                      key={project.id}
                      name={project.name}
                      description={project.description}
                      cardID={project.id}
                      userID={user.id}
                      ownerId={project.owner_id}
                      acceptInviteCallBackModel={showInvitationModel}
                      followers_count={project.followers_count}
                      apps_count={project.apps_count}
                      disabled={project.disabled}
                      admin_disabled={project.admin_disabled}
                    />
                  ))}
              </div>
            )}

            {showInviteModel === true && (
              <div className={styles.ProjectDeleteModel}>
                <Modal
                  showModal={showInvitationModel}
                  onClickAway={hideInvitationModel}
                >
                  <div className={styles.ModelContent}>
                    <div className={styles.ModelHeader}>
                      Invitation to this project{" "}
                    </div>
                    <div className={styles.UpdateForm}>
                      <div className={styles.InformationText}>
                        You have been invited to join this project as (a/an)
                        <span className={styles.Role}>
                          {" "}
                          {inviteeModelRole}.
                        </span>
                      </div>
                      <div className={styles.InformationWarning}>
                        If you decline, you will not be able to see this project
                        again unless you are re-invited.
                      </div>
                      <div className={styles.UpdateProjectModelButtons}>
                        <PrimaryButton
                          color="red"
                          onClick={() => {
                            handleInvitationDecline();
                          }}
                        >
                          {decliningInvitation ? <Spinner /> : "Decline"}
                        </PrimaryButton>
                        <PrimaryButton
                          color="primary"
                          onClick={() => {
                            handleInvitationAcceptence();
                          }}
                        >
                          {acceptingInvitation ? <Spinner /> : "Accept"}
                        </PrimaryButton>
                      </div>
                      {invitationError && (
                        <div className={styles.InformationWarning}>
                          {invitationError}
                        </div>
                      )}
                    </div>
                  </div>
                </Modal>
              </div>
            )}
            {isFetched && projectsData?.data?.data?.projects?.length === 0 && (
              <div className={styles.NoResourcesMessage}>
                You haven’t created any projects yet. Click the &nbsp;{" "}
                <ButtonPlus className={styles.ButtonPlusSmall} /> &nbsp; button
                to add a project.
              </div>
            )}
            {isError && (
              <div className={styles.NoResourcesMessage}>
                Oops! Something went wrong! Failed to retrieve Projects.
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.FooterRow}>
        {projectsData?.data?.data?.pagination?.pages > 1 &&
          isFetched &&
          !openCreateComponent && (
            <div className={styles.PaginationSection}>
              {/* customise pagination for shared and personal projects */}
              <Pagination
                total={projectsData.data?.data?.pagination?.pages}
                current={currentPaginationPage}
                onPageChange={onPageChange}
              />
            </div>
          )}
        <div>
          Copyright {new Date().getFullYear()} Crane Cloud. All Rights Reserved.
        </div>
      </div>
    </div>
  );
};

export default UserProjectsPage;
