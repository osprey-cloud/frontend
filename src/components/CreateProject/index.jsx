import React, { useCallback, useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import PrimaryButton from "../PrimaryButton";
import Select from "../Select";
import Header from "../Header";
import Spinner from "../Spinner";
import Feedback from "../Feedback";
import BlackInputText from "../BlackInputText";
import ToggleOnOffButton from "../ToggleOnOffButton";
import styles from "./CreateProject.module.css";
import { handlePostRequestWithOutDataObject } from "../../apis/apis.js";
import { retrieveProjectTypes } from "../../helpers/projecttypes";
import { namedOrganisations } from "../../helpers/projectOrganisations";
import handleProjectValidation from "../../helpers/validation";
import TagInput from "../ProjectTagInput";
import getClustersList from "../../redux/actions/clusters.js";

const CreateProject = ({ closeComponent }) => {
  const dispatch = useDispatch();

  const getClusters = useCallback(
    () => dispatch(getClustersList()),
    [dispatch]
  );
  useEffect(() => {
    getClusters();
  }, [getClusters]);

  const clusters = useSelector(
    (state) => state.clustersReducer.clusters.clusters
  );

  const data = useSelector((state) => state.user.data);

  const [projectName, setProjectName] = useState("");
  const [clusterID, setClusterID] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectType, setProjectType] = useState("");
  const [projectOrganisation, setProjectOrganisation] = useState("");
  const [error, setError] = useState("");
  const [multiCluster, setMultiCluster] = useState(false);
  const [clusterChoices, setClusterChoices] = useState(false);
  const [othersBool, setOthersBool] = useState(false);
  const [selectedClusters, setSelectedClusters] = useState(
    new Array(clusters?.length).fill(false)
  );
  const [otherType, setOtherType] = useState("");
  const [addingProject, setAddingProject] = useState(false);
  const [addProjectError, setAddProjectError] = useState("");
  const [addErrorCode, setAddErrorCode] = useState("");
  const [tags, setTags] = useState([]);

  const handleTypeSelectChange = (selected) => {
    if (selected.id === 6) {
      setOthersBool(true);
    } else {
      setProjectType(selected.value);
      setOthersBool(false);
    }
  };

  const handleOrganisationSelectChange = (selected) => {
    setProjectOrganisation(selected.value);
  };

  const handleDatacenterSelectChange = (selected) => {
    setClusterID(selected.id);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "projectName") setProjectName(value);
    if (name === "projectDescription") setProjectDescription(value);
    if (name === "otherType") setOtherType(value);
    setError("");
    setAddProjectError("");
  };

  const handleOnChange = (index) => {
    setSelectedClusters((prev) =>
      prev.map((item, i) => (i === index ? !item : item))
    );
  };

  const changeMultiSelectioOption = () => {
    setClusterChoices(!clusterChoices);
  };

  // eslint-disable-next-line
  const togglemultiCluster = () => {
    setMultiCluster(!multiCluster);
  };

  const handleSubmit = () => {
    const capitalizeFirstLetter = (input) =>
      input.charAt(0).toUpperCase() + input.slice(1);
    const approvedType = othersBool
      ? capitalizeFirstLetter(otherType)
      : capitalizeFirstLetter(projectType);

    const validationError = handleProjectValidation(
      projectName,
      projectDescription,
      approvedType,
      projectOrganisation,
      clusterID
    );

    if (validationError) {
      setError(validationError);
    } else {
      const newProject = {
        description: projectDescription,
        cluster_id: clusterID,
        name: projectName,
        owner_id: data.id,
        organisation: projectOrganisation,
        project_type: approvedType,
      };
      if (tags.length > 0) {
        newProject.tags_add = tags;
      }
      addNewProject(newProject);
    }
  };

  const addNewProject = (newProject) => {
    setAddingProject(true);
    setAddProjectError("");

    handlePostRequestWithOutDataObject(newProject, `/projects`)
      .then(() => {
        window.location.href = `/projects`;
      })
      .catch((error) => {
        setAddProjectError("Failed to add project. Try again later");
        setAddingProject(false);
        setAddErrorCode(error.response?.status);
      });
  };

  const types = retrieveProjectTypes();
  const presetOrganisations = namedOrganisations();
  const onTagsChange = (tags) => {
    setTags(tags);
  };

  return (
    <div className={styles.MainContentSection}>
      <Header />
      <div className={styles.InformationBarSection}>
        <div className={styles.InformationBar}>
          <div className={styles.InformationBarWithButton}>
            <div className={styles.InfoHeader}>Create Project</div>
            <div className={styles.RoundAddButtonWrap}>
              <PrimaryButton btntype="close" onClick={closeComponent}>
                close
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.ContentSection}>
        <div className={styles.FormsSection}>
          <div className="Card">
            <div className={styles.ProjectForm}>
              <div className={styles.LeftFormElements}>
                <div className={styles.Element}>
                  <div className={styles.ElementTitle}>Datacenter</div>
                  <Select
                    required
                    placeholder="Choose Datacenter location"
                    options={clusters}
                    onChange={handleDatacenterSelectChange}
                  />
                  {multiCluster && (
                    <div>
                      <div className={styles.ClusterToggleSection}>
                        <ToggleOnOffButton
                          onClick={changeMultiSelectioOption}
                        />
                        &nbsp; Cranecloud automatically selects the rest of the
                        clusters for this project.
                      </div>
                      {clusterChoices && (
                        <div>
                          <div className={styles.MultiSelectioOption}>
                            Please any other cluster for this project.
                          </div>
                          <div className={styles.Multipleclusters}>
                            {clusters.map(({ name, id }, index) => (
                              <li className={styles.ListStyle} key={index}>
                                <div className={styles.clusterListItem}>
                                  <div className={styles.leftsection}>
                                    <input
                                      type="checkbox"
                                      id={id}
                                      name={name}
                                      value={name}
                                      checked={selectedClusters[index]}
                                      onChange={() => handleOnChange(index)}
                                    />
                                    <label
                                      className={styles.ClusterLabel}
                                      htmlFor={id}
                                    >
                                      {name}
                                    </label>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className={styles.Element}>
                  <div className={styles.ElementTitle}>Name</div>
                  <BlackInputText
                    required
                    placeholder="Project name"
                    name="projectName"
                    value={projectName}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.Element}>
                  <div className={styles.ElementTitle}>Organisation</div>
                  <Select
                    required
                    placeholder="Choose Organisation type"
                    options={presetOrganisations}
                    onChange={handleOrganisationSelectChange}
                  />
                </div>
                <div className={styles.Element}>
                  <div className={styles.ElementTitle}>Type</div>
                  <Select
                    required
                    placeholder="Choose project type"
                    options={types}
                    onChange={handleTypeSelectChange}
                  />
                  {othersBool && (
                    <BlackInputText
                      required
                      placeholder="Type of project"
                      name="otherType"
                      value={otherType}
                      onChange={handleChange}
                    />
                  )}
                </div>
                <div className={styles.Element}>
                  <div className={styles.ElementTitle}>Description</div>
                  <textarea
                    className={styles.TextArea}
                    type="text"
                    placeholder="Project description"
                    rows="4"
                    cols="50"
                    name="projectDescription"
                    value={projectDescription}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.Element}>
                  <div className={styles.ElementTitle}>Project tags</div>
                  {/* <div className={`${styles.inputTagSection}`}> */}
                  <TagInput onTagsChange={onTagsChange} />
                  {/* </div> */}
                </div>
                {error && (
                  <div className={styles.CreateProjectError}>
                    <Feedback type="error" message={error} />
                  </div>
                )}
                {addProjectError && (
                  <div className={styles.CreateProjectError}>
                    <Feedback
                      message={
                        addErrorCode === 409
                          ? "Name already in use, please choose another"
                          : addProjectError
                      }
                      type={
                        addProjectError === "" && addErrorCode !== 409
                          ? "success"
                          : "error"
                      }
                    />
                  </div>
                )}
                <div className={styles.InnerContent}>
                  <PrimaryButton
                    className="AuthBtn"
                    onClick={handleSubmit}
                    color="primary"
                  >
                    {addingProject ? <Spinner /> : "Create Project"}
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
