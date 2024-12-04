import React, { useEffect, useState } from "react";
import styles from "./NotebookExperimentPage.module.css";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import { handleGetRequest } from "../../apis/apis";
import PrimaryButton from "../../components/PrimaryButton";
import NotebookExperimentDetailsPage from "../NotebookRunDetailsPage/index.jsx";
import Select from "../../components/Select";
import Modal from "../../components/Modal";
import BlackInputText from "../../components/BlackInputText";
import {
  useExperimentDelete,
  useExperimentDetails,
  useExperimentList,
  useExperimentRunDelete,
  useExperimentRuns,
} from "../../hooks/useNotebookExperiments";
import tellAge from "../../helpers/ageUtility.js";
import { calculateDuration } from "../../helpers/durationUtility.js";
import Spinner from "../../components/Spinner/index.js";

const NotebookExperimentPage = () => {
  const { appID } = useParams();

  const [app, setApp] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  // modals
  const [spin, setSpin] = useState(false);
  const [createExperimentModal, setCreateExperimentModal] = useState(false);
  const [editExperimentModal, setEditExperimentModal] = useState(false);
  const [deleteExperimentModal, setDeleteExperimentModal] = useState(false);
  const [deleteExperimentRunsModal, setDeleteExperimentRunsModal] =
    useState(false);

  const [experimentName, setExperimentName] = useState("");
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [selectedExperimentName, setSelectedExperimentName] = useState(
    "Choose an experiment"
  );
  const [selectedExperimentRun, setSelectedExperimentRun] = useState(null);

  const [openNewRun, setOpenNewRun] = useState(false);
  const [activeTab, setActiveTab] = useState("classical");

  // fetch experiments
  const { data: experiments, isLoading, refetch } = useExperimentList();

  // fetch details for an experiment
  const {
    data: experimentDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useExperimentDetails(selectedExperiment);

  // fetch runs for an experiment
  const { data: experimentRuns, isLoading: isLoadingRuns } =
    useExperimentRuns(selectedExperiment);

  // delete runs for an experiment
  const deleteRunsMutation = useExperimentRunDelete();

  // delete an experiment
  const deleteExperimentMutation = useExperimentDelete();

  // event handlers
  const handleRowClick = (runId) => {
    setSelectedExperimentRun(runId);
  };

  const handleBackToTable = () => {
    setSelectedExperimentRun(null);
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((rowId) => rowId !== id)
        : [...prevSelected, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) return;

    setSpin(true);
    try {
      await Promise.all(
        selectedRows.map((id) => deleteRunsMutation.mutateAsync(id))
      );
      setSpin(false);
      setDeleteExperimentRunsModal(false);
      setSelectedRows([]);
    } catch (error) {
      console.error("Error deleting experiment runs:", error);
    }
  };

  const handleDeleteSelectedExperiment = async () => {
    if (!selectedExperiment) return;

    setSpin(true);
    try {
      deleteExperimentMutation.mutate(selectedExperiment);
      setSpin(false);
      setDeleteExperimentModal(false);
      refetch();
      window.location.reload();
    } catch (error) {
      console.error("Error deleting experiment:", error);
    }
  };

  const handleExperimentChange = (selectedOption) => {
    const selectedValue = selectedOption.value;
    setSelectedExperimentName(selectedOption.name);
    setSelectedExperiment(selectedValue);
  };

  const getAppInfo = () => {
    if (!app) return null;
    return {
      name: app.name,
      status: app.app_running_status,
      url: app.url,
      age: app.age,
      alias: app.alias,
      image: app.image,
      port: app.port,
      disable: app.disabled,
    };
  };

  useEffect(() => {
    handleGetRequest(`/apps/${appID}`)
      .then((response) => {
        setApp(response.data.data.apps);
      })
      .catch((error) => {
        console.error(error?.response?.data?.message);
      });
  }, [appID]);

  const appInfo = getAppInfo();

  return (
    <>
      <DashboardLayout
        name={appInfo.name}
        header={"Notebook Experiments"}
        appCategory={"notebook"}
        showBtn
        buttontext="+ new experiment"
        btnAction={setCreateExperimentModal}
      >
        {selectedExperimentRun ? (
          <NotebookExperimentDetailsPage
            handleBackToTable={handleBackToTable}
            runId={selectedExperimentRun}
          />
        ) : (
          <div className={styles.AppMetricsPage}>
            <div className={styles.Container}>
              <div className={styles.Header}>
                <div>
                  <Select
                    placeholder={selectedExperimentName}
                    options={
                      experiments
                        ? experiments.map((experiment) => ({
                            name: experiment.name,
                            value: experiment.experiment_id,
                          }))
                        : []
                    }
                    onChange={(selectedOption) =>
                      handleExperimentChange(selectedOption)
                    }
                  />
                </div>

                <div className={styles.RightDashboardButtons}>
                  {selectedExperiment && (
                    <>
                      <PrimaryButton
                        color="primary"
                        onClick={() => setEditExperimentModal(true)}
                      >
                        Edit Experiment
                      </PrimaryButton>

                      <PrimaryButton
                        color="red"
                        onClick={() => setDeleteExperimentModal(true)}
                      >
                        Delete Experiment
                      </PrimaryButton>
                    </>
                  )}

                  {selectedRows.length > 0 && (
                    <PrimaryButton
                      color="red"
                      onClick={() => setDeleteExperimentRunsModal(true)}
                      disabled={selectedRows.length === 0}
                    >
                      Delete Selected Rows
                    </PrimaryButton>
                  )}
                </div>
              </div>

              {selectedExperiment && (
                <div>
                  {isLoadingDetails ? (
                    <p>Loading experiment details...</p>
                  ) : detailsError ? (
                    <p>Failed to load experiment details</p>
                  ) : (
                    <p className={styles.Description}>
                      Experiment ID: {experimentDetails.experiment_id} |
                      Created: {tellAge(experimentDetails.creation_time)} | Last
                      Updated: {tellAge(experimentDetails.last_update_time)} |
                      Lifecycle Stage:{" "}
                      <span className="current-label">
                        {experimentDetails.lifecycle_stage}
                      </span>
                    </p>
                  )}
                </div>
              )}

              <div className={styles.FiltersSection}>
                <input
                  type="text"
                  placeholder="Search metrics or parameters..."
                  className={styles.SearchBar}
                />
                <div className={styles.SelectGroup}>
                  <Select
                    placeholder="Time Created: All time"
                    options={[
                      { name: "All time", value: "all" },
                      { name: "Last hour", value: "1h" },
                      { name: "Last 24 hours", value: "24h" },
                      { name: "Last 7 days", value: "7d" },
                      { name: "Last 30 days", value: "30d" },
                    ]}
                  />
                  <Select
                    placeholder="Status: All"
                    options={[
                      { name: "All", value: "all" },
                      { name: "Finished", value: "FINISHED" },
                      { name: "Failed", value: "FAILED" },
                    ]}
                  />

                  <PrimaryButton color="primary">Refresh</PrimaryButton>

                  {selectedExperiment && (
                    <PrimaryButton onClick={() => setOpenNewRun(true)}>
                      + New run
                    </PrimaryButton>
                  )}
                </div>
              </div>

              <div
                className={
                  isLoading || isLoadingRuns
                    ? "ResourcesTable LoadingResourcesTable"
                    : "ResourcesTable"
                }
              >
                <table className="UsersTable">
                  <thead className="uppercase">
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          onChange={(e) =>
                            setSelectedRows(
                              e.target.checked
                                ? experimentRuns?.map((row) => row.run_id)
                                : []
                            )
                          }
                          checked={
                            selectedRows.length === experimentRuns?.length &&
                            experimentRuns?.length > 0
                          }
                        />
                      </th>
                      <th>Run Name</th>
                      <th>Created</th>
                      <th>Duration</th>
                      <th>Artifacts URI</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  {isLoadingRuns || isLoading ? (
                    <tbody>
                      <tr className="TableLoading">
                        <td className="TableTdSpinner">
                          <div className="SpinnerWrapper">
                            <Spinner size="big" />
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {experimentRuns?.map((row, index) => (
                        <tr
                          key={index}
                          className={{
                            ...styles.tableCell,
                            ...(index % 2 === 0 ? styles.rowHover : {}),
                          }}
                          onClick={(e) => {
                            if (e.target.tagName !== "INPUT") {
                              handleRowClick(row.run_id);
                            }
                          }}
                        >
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(row.run_id)}
                              onChange={() => handleSelectRow(row.run_id)}
                            />
                          </td>
                          <td>{row.run_name}</td>
                          <td>{tellAge(row.start_time)}</td>
                          <td>
                            {calculateDuration(row?.start_time, row?.end_time)}
                          </td>
                          <td>{row.artifact_uri}</td>
                          <td>
                            {row.status === "FINISHED" ? (
                              <span className="current-label">FINISHED</span>
                            ) : (
                              <span className="error-label">FAILED</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>
                {!isLoadingRuns &&
                  experimentRuns?.length === 0 &&
                  experimentRuns !== undefined && (
                    <div className={styles.noDataSection}>
                      <p>No runs have been logged yet!</p>
                    </div>
                  )}
                {!isLoading &&
                  !isLoadingRuns &&
                  experimentRuns === undefined && (
                    <div className={styles.noDataSection}>
                      <p>
                        No runs have been logged yet, Please choose an
                        experiment or create one!
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

        <Modal
          showModal={createExperimentModal}
          onClickAway={() => {
            setCreateExperimentModal(false);
          }}
        >
          <div className="ModalContainer">
            <h2 className="ModalTitle">Create Notebook Experiment</h2>
            <form className="ModalContent">
              <label>Name *</label>
              <BlackInputText
                name={"Experiment Name"}
                value={experimentName}
                onChange={(e) => {
                  setExperimentName(e.target.value);
                }}
                placeholder="Input an experiment name"
              />
              <div className="ModalActions">
                <PrimaryButton
                  color="primary"
                  onClick={() => {
                    setCreateExperimentModal(false);
                  }}
                >
                  Close
                </PrimaryButton>
                <PrimaryButton>Create</PrimaryButton>
              </div>
            </form>
          </div>
        </Modal>

        <Modal
          showModal={openNewRun}
          onClickAway={() => {
            setOpenNewRun(false);
          }}
        >
          <h2 className="ModalTitle">New run using notebook</h2>
          Run this code snippet in a notebook or locally, to create an
          experiment run
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${
                activeTab === "classical" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("classical")}
            >
              Classical ML
            </button>
            <button
              className={`${styles.tab} ${
                activeTab === "llm" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("llm")}
            >
              LLM
            </button>
          </div>
          <div className={styles.content}>
            {activeTab === "classical" && (
              <pre>
                <code>
                  {`!pip install mlflow
import mlflow
from sklearn.model_selection import train_test_split
from sklearn.datasets import load_diabetes
from sklearn.ensemble import RandomForestRegressor
from mlflow.tracking import MlflowClient

# we need to find a way of bringing users to the platform and not
# to the mlflow dashboard where they can see everything
mlflow.set_tracking_uri("https://mlflow.renu-01.cranecloud.io")
mlflow.set_experiment(experiment_id="${selectedExperiment}")

mlflow.autolog()
db = load_diabetes()

X_train, X_test, y_train, y_test = train_test_split(db.data, db.target)

# Create and train models.
rf = RandomForestRegressor(n_estimators=100, max_depth=6, max_features=3)
rf.fit(X_train, y_train)

# Use the model to make predictions on the test dataset.
predictions = rf.predict(X_test)`}
                </code>
              </pre>
            )}
            {activeTab === "llm" && (
              <pre>
                <code>
                  {`import mlflow
import openai

# you must set the OPENAI_API_KEY environment variable
assert (
  "OPENAI_API_KEY" in os.environ
), "Please set the OPENAI_API_KEY environment variable."

# set the experiment id
mlflow.set_experiment(experiment_id="3")

system_prompt = (
  "The following is a conversation with an AI assistant."
  + "The assistant is helpful and very friendly."
)

# start a run
mlflow.start_run()
mlflow.log_param("system_prompt", system_prompt)`}
                </code>
              </pre>
            )}
          </div>
          <div className="ModalActions">
            <PrimaryButton
              color="primary"
              onClick={() => {
                setOpenNewRun(false);
              }}
            >
              Close
            </PrimaryButton>
          </div>
        </Modal>

        <Modal
          showModal={deleteExperimentModal}
          onClickAway={() => {
            setDeleteExperimentModal(false);
          }}
        >
          <div className="ModalContainer">
            <h2>Are you sure you want to delete this experiment ?</h2>
            <div className="ModalActions">
              <PrimaryButton
                color="primary"
                onClick={() => {
                  setDeleteExperimentModal(false);
                }}
              >
                Cancel
              </PrimaryButton>
              <PrimaryButton
                onClick={() => {
                  handleDeleteSelectedExperiment();
                }}
              >
                {spin ? <Spinner /> : "Delete"}
              </PrimaryButton>
            </div>
          </div>
        </Modal>

        <Modal
          showModal={deleteExperimentRunsModal}
          onClickAway={() => {
            setDeleteExperimentRunsModal(false);
          }}
        >
          <div className="ModalContainer">
            <h2>Are you sure you want to delete the selected runs ?</h2>
            <div className="ModalActions">
              <PrimaryButton
                color="primary"
                onClick={() => {
                  setDeleteExperimentRunsModal(false);
                }}
              >
                Cancel
              </PrimaryButton>
              <PrimaryButton onClick={handleDeleteSelected}>
                {spin ? <Spinner /> : "Delete"}
              </PrimaryButton>
            </div>
          </div>
        </Modal>

        <Modal
          showModal={editExperimentModal}
          onClickAway={() => {
            setEditExperimentModal(false);
          }}
        >
          <div className="ModalContainer">
            <h2 className="ModalTitle">Edit Experiment</h2>
            <form className="ModalContent">
              <label>Name *</label>
              <BlackInputText
                name={"Experiment Name"}
                value={selectedExperimentName}
                onChange={(e) => {
                  setExperimentName(e.target.value);
                }}
                placeholder="Input an experiment name"
              />
              <div className="ModalActions">
                <PrimaryButton
                  color="primary"
                  onClick={() => {
                    setEditExperimentModal(false);
                  }}
                >
                  Close
                </PrimaryButton>
                <PrimaryButton>Submit</PrimaryButton>
              </div>
            </form>
          </div>
        </Modal>
      </DashboardLayout>
    </>
  );
};

export default NotebookExperimentPage;
