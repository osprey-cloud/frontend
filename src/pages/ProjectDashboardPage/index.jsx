import React, { useEffect, useCallback, useState } from "react";
import PropTypes from "prop-types";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

import getProjectCPU, { clearProjectCPU } from "../../redux/actions/projectCPU";
import getProjectMemory from "../../redux/actions/projectMemory";
import getProjectNetwork from "../../redux/actions/projectNetwork";
import LineChartComponent from "../../components/LineChart";
import MetricsCard from "../../components/MetricsCard";
import { ReactComponent as CPUIcon } from "../../assets/images/cpu.svg";
import { ReactComponent as NetworkIcon } from "../../assets/images/wifi.svg";
import { ReactComponent as MemoryIcon } from "../../assets/images/hard-drive.svg";
import "./ProjectDashboardPage.css";
import {
  formatCPUMetrics,
  formatMemoryMetrics,
  formatNetworkMetrics,
} from "../../helpers/formatMetrics";
import AppsList from "../../components/AppsList";
import { getProjectCurrentProject } from "../../helpers/projectName";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import Select from "../../components/Select";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import Modal from "../../components/Modal";
import styles from "../../pages/createAIAppPage/createAIAppPage.module.css";
import BlackInputText from "../../components/BlackInputText";
import PrimaryButton from "../../components/PrimaryButton";
import Feedback from "../../components/Feedback";
import Spinner from "../../components/Spinner";
import { useMutation } from "@tanstack/react-query";
import { useAppDeployment } from "../../hooks/useAppDeploymentMutation";
import { validateName } from "../../helpers/validation";

const ProjectDashboardPage = () => {
  const { projectID } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();

  const { projects, memoryMetrics, cpuMetrics, networkMetrics, credits } =
    useSelector((state) => ({
      projects: state?.userProjectsReducer?.projects,
      memoryMetrics: state?.projectMemoryReducer?.memoryMetrics,
      cpuMetrics: state?.projectCPUReducer?.cpuMetrics,
      networkMetrics: state?.projectNetworkReducer?.networkMetrics,
      credits: state?.userCreditsReducer?.credits,
    }));

  const [openJupyterNotebookModel, setOpenJupyterNotebookModel] =
    useState(false);
  const [jupiterNoteBookName, setJupiterNoteBookName] = useState("");
  const [validationError, setValidationError] = useState("");

  const {
    isSuccess: deploymentSuccess,
    error: deploymentError,
    isPending: deploymentPending,
    mutate: deployApp,
  } = useMutation({
    mutationFn: useAppDeployment,
  });

  useEffect(() => {
    dispatch(getProjectMemory(projectID, {}));
    dispatch(clearProjectCPU());
    dispatch(getProjectCPU(projectID, {}));
    dispatch(getProjectNetwork(projectID, {}));
  }, [dispatch, projectID]);

  const getMemoryMetrics = useCallback(() => {
    return formatMemoryMetrics(projectID, memoryMetrics);
  }, [projectID, memoryMetrics]);

  const getCPUMetrics = useCallback(() => {
    return formatCPUMetrics(projectID, cpuMetrics);
  }, [projectID, cpuMetrics]);

  const getNetworkMetrics = useCallback(() => {
    return formatNetworkMetrics(projectID, networkMetrics);
  }, [projectID, networkMetrics]);

  const projectDetails = getProjectCurrentProject(projects, projectID);

  useEffect(() => {
    localStorage.setItem("project", JSON.stringify(projectDetails));
  }, [projectDetails]);

  const handleJupyterNotebookDeployment = async () => {
    if (!jupiterNoteBookName) {
      setValidationError("Please enter a name for the app");
    }
    if (validateName(jupiterNoteBookName) === false) {
      setValidationError("Name should start with a letter");
    } else if (validateName(jupiterNoteBookName) === "false_convention") {
      setValidationError(
        "Name may only contain letters,numbers,dot and a hypen -"
      );
    } else if (jupiterNoteBookName.length > 27) {
      setValidationError("Name may not exceed 27 characters");
    }
    const data = {
      name: jupiterNoteBookName,
      is_notebook: true,
      projectID: projectID,
    };
    await deployApp(data);
  };

  useEffect(() => {
    if (deploymentSuccess) {
      history.push(`/projects`);
    }
  }, [deploymentSuccess]);

  return (
    <DashboardLayout
      credits={credits}
      name={projectDetails?.name}
      header="Project Dashboard"
    >
      <div className="SectionTitle">Project Metrics</div>
      <div className="MetricCardsSection">
        <MetricsCard icon={<CPUIcon />} title="CPU" className="CardDimensions">
          <LineChartComponent
            lineDataKey="cpu"
            preview
            data={getCPUMetrics()}
          />
        </MetricsCard>
        <MetricsCard
          icon={<MemoryIcon />}
          title="MEMORY"
          className="CardDimensions"
        >
          <LineChartComponent
            lineDataKey="memory"
            preview
            data={getMemoryMetrics()}
          />
        </MetricsCard>
        <MetricsCard
          icon={<NetworkIcon />}
          title="NETWORK"
          className="CardDimensions"
        >
          <LineChartComponent
            lineDataKey="network"
            preview
            data={getNetworkMetrics()}
          />
        </MetricsCard>
      </div>
      <div className="SectionTitle ProjectDashboardTitleSection">
        <div className="">Project Apps</div>
        <div className="NewAppSelectButtonClass">
          <Select
            // className="NewAppSelectPlaceHolder"
            options={[
              { id: "1", name: "Regular App" },
              { id: "2", name: "Jupyter Notebook" },
            ]}
            placeholder="+ Create App"
            onChange={(e) => {
              if (e.name === "Regular App") {
                history.push(
                  `/projects/${projectID}/apps?initialOpenModal=true`
                );
              } else if (e.name === "Jupyter Notebook") {
                setOpenJupyterNotebookModel(true);
              }
            }}
          />
        </div>
      </div>
      <AppsList
        params={{ projectID }}
        word=""
        message="You have no apps currently, please go to Apps section on the sidebar to create one"
      />

      <Modal
        showModal={openJupyterNotebookModel}
        onClickAway={() => {
          setOpenJupyterNotebookModel(false);
        }}
      >
        <div className={styles.createAIAppJupyterNotebookModalContainer}>
          <h2 className={styles.createAIAppJupyterNotebookModalTitle}>
            Create Jupyter Notebook
          </h2>
          <form className={styles.createAIAppJupyterNotebookModalForm}>
            <label>Name *</label>
            <BlackInputText
              name={"jupiterNoteBookName"}
              value={jupiterNoteBookName}
              onChange={(e) => {
                setJupiterNoteBookName(e.target.value);
              }}
              placeholder="Enter your notebook name"
            />
            <div className={styles.createAIAppActionButtonsContainer}>
              <PrimaryButton
                color="primary"
                onClick={() => {
                  setOpenJupyterNotebookModel(false);
                }}
              >
                Close
              </PrimaryButton>
              <PrimaryButton
                onClick={(e) => {
                  e.preventDefault();
                  handleJupyterNotebookDeployment();
                }}
                disabled={jupiterNoteBookName === "" || deploymentPending}
              >
                {deploymentPending ? <Spinner /> : "Create"}
              </PrimaryButton>
            </div>
            {validationError && (
              <Feedback type="error" message={validationError} />
            )}
            {deploymentError && (
              <Feedback
                type="error"
                message={"Failed to deploy notebook, Please try again later"}
              />
            )}
          </form>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

ProjectDashboardPage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectID: PropTypes.string,
    }),
  }),
};

export default ProjectDashboardPage;
