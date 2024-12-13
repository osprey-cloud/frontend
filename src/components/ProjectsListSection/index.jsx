import React, { useEffect } from "react";
import styles from "./ProjectsListSection.module.css";
import NewProjectCard from "../NewProjectCard";
import PrimaryButton from "../PrimaryButton";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import Spinner from "../Spinner";
import getUserProjects from "../../redux/actions/projectsList";
import { ReactComponent as InfoSvg } from "../../assets/images/infosvg.svg";
import { useProjects } from "../../hooks/useProjects";

const ProjectListSection = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const { data: userProjects, isLoading: isLoadingUserProjects } =
    useProjects(1);

  useEffect(() => {
    dispatch(getUserProjects(1));
  }, [dispatch]);

  const noProjectsFound = userProjects?.data?.data?.projects?.length === 0 && !isLoadingUserProjects;

  const handleViewMoreClick = () => {
    history.push("/projects");
  };

  return (
    <div className={styles.projectCards}>
      <PrimaryButton
              className={styles.viewMoreButton}
              onClick={handleViewMoreClick}
            >
              View All
            </PrimaryButton>
      <h2>Projects</h2>
      {isLoadingUserProjects ? (
        <div className={styles.noActivity}>
          <div className={styles.NoResourcesMessage}>
            <div className={styles.SpinnerWrapper}>
              <Spinner size="big" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {noProjectsFound ? (
            <div className={styles.noActivity}>
              <InfoSvg />
              <p className={styles.noActivityMessage}>No Projects Found</p>
            </div>
          ) : (
            userProjects?.data?.data?.projects
              ?.slice(0, 5)
              .map((project, index) => (
                <NewProjectCard
                  key={index}
                  projectID={project.id}
                  name={project.name}
                  description={project.description}
                  organization={project.organisation}
                  type={project.project_type}
                  number={project.apps_count}
                  projectFollowers={project.followers_count}
                />
              ))
          )}
        </>
      )}
    </div>
  );
};

export default ProjectListSection;
