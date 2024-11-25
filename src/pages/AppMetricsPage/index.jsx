import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useParams, Redirect, useLocation } from "react-router-dom";
import Spinner from "../../components/Spinner";
import MetricsCard from "../../components/MetricsCard";
import { ReactComponent as RedeployICon } from "../../assets/images/redeploy.svg";
import { ReactComponent as CPUIcon } from "../../assets/images/cpu.svg";
import { ReactComponent as NetworkIcon } from "../../assets/images/wifi.svg";
import { ReactComponent as MemoryIcon } from "../../assets/images/hard-drive.svg";
import styles from "./AppMetricsPage.module.css";
import LineChartComponent from "../../components/LineChart";
import LogsFrame from "../../components/LogsFrame";
import {
  handlePostRequestWithDataObject,
  handlePostRequestWithOutDataObject,
  handleGetRequest,
} from "../../apis/apis";
import getAppMemory, { clearAppMemory } from "../../redux/actions/appMemory";
import getAppCPU from "../../redux/actions/appCPU";
import getAppNetwork from "../../redux/actions/appNetwork";
import {
  formatAppMemoryMetrics,
  formatAppCPUMetrics,
  formatAppNetworkMetrics,
} from "../../helpers/formatMetrics";
import revertUrl, { clearUrlRevertState } from "../../redux/actions/revertUrl";
import AppStatus from "../../components/AppStatus";
import { ReactComponent as CopyText } from "../../assets/images/copytextblue.svg";
import { ReactComponent as Checked } from "../../assets/images/checked.svg";
import { ReactComponent as TrainedModel } from "../../assets/images/trainedModel.svg";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import BlackInputText from "../../components/BlackInputText";
import PrimaryButton from "../../components/PrimaryButton";

const AppMetricsPage = () => {
  const { projectID, appID } = useParams();
  const dispatch = useDispatch();

  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const trainedModelApp = queryParams.get("trainedModel") === "true";

  const [urlChecked, setUrlChecked] = useState(false);
  const [app, setApp] = useState([]);
  const [logs, setLogs] = useState([]);
  const [fetchingLogs, setFetchingLogs] = useState(true);
  const [logsError, setLogsError] = useState("");
  const [redeploy, setRedeploy] = useState(false);
  const [deployError, setDeployError] = useState("");
  const [spin, setSpin] = useState(false);
  const [isJupyterNotebook, setIsJupyterNotebook] = useState(false);
  const [activeTrainedModelTab, setActiveTrainedModelTab] = useState("readMe");
  const [trainedModelInput, setTrainedModelInput] = useState("");

  const {
    appMemoryMetrics,
    appCPUMetrics,
    appNetworkMetrics,
    isReverting,
    isReverted,
  } = useSelector((state) => ({
    appMemoryMetrics: state.appMemoryReducer.appMemoryMetrics,
    appCPUMetrics: state.appCpuReducer.appCPUMetrics,
    appNetworkMetrics: state.appNetworkReducer.appNetworkMetrics,
    isReverting: state.revertUrlReducer.isReverting,
    isReverted: state.revertUrlReducer.isReverted,
  }));

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
    setSpin(true);

    handlePostRequestWithDataObject(
      { timestamps: true },
      `/projects/${projectID}/apps/${appID}/logs`
    )
      .then((response) => {
        setLogs(response.data.data.pods_logs);
        setFetchingLogs(false);
      })
      .catch(() => {
        setLogsError("Failed to fetch logs");
        setFetchingLogs(false);
      });

    handleGetRequest(`/apps/${appID}`)
      .then((response) => {
        setApp(response.data.data.apps);
        setSpin(false);
      })
      .catch((error) => {
        setRedeploy(true);
        setDeployError(error?.response?.data?.message);
      });

    dispatch(clearAppMemory());
    dispatch(clearUrlRevertState());
    dispatch(getAppMemory(projectID, appID, {}));
    dispatch(getAppCPU(projectID, appID, {}));
    dispatch(getAppNetwork(projectID, appID, {}));
  }, [dispatch, projectID, appID]);

  useEffect(() => {
    if (app?.is_notebook) {
      setIsJupyterNotebook(true);
    }
  }, [app]);

  const getAppMemoryMetrics = useCallback(() => {
    return formatAppMemoryMetrics(appID, appMemoryMetrics);
  }, [appID, appMemoryMetrics]);

  const getAppCPUMetrics = useCallback(() => {
    return formatAppCPUMetrics(appID, appCPUMetrics);
  }, [appID, appCPUMetrics]);

  const getAppNetworkMetrics = useCallback(() => {
    return formatAppNetworkMetrics(appID, appNetworkMetrics);
  }, [appID, appNetworkMetrics]);

  const copyUrl = () => {
    const appInfo = getAppInfo();
    navigator.clipboard.writeText(appInfo.url);
    setUrlChecked(true);
  };

  const regenerate = () => {
    dispatch(revertUrl(appID));
  };

  const handleRedeployApp = () => {
    setSpin(true);

    handlePostRequestWithOutDataObject({}, `/apps/${appID}/redeploy`)
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        console.error("Failed to redeploy app:", error);
      });
  };

  if (isReverted) {
    dispatch(clearUrlRevertState());
    return <Redirect to="/projects" noThrow />;
  }

  const formattedMemoryMetrics = getAppMemoryMetrics();
  const formattedCPUMetrics = getAppCPUMetrics();
  const formattedNetworkMetrics = getAppNetworkMetrics();
  const appInfo = getAppInfo();

  return (
    <DashboardLayout
      name={appInfo.name}
      header={appInfo.name}
      viewAppLink={appInfo.url}
      // specify text for jupiter notebook
      viewAppLinkText={
        isJupyterNotebook ? "Open Notebook" : trainedModelApp ? "Run Model" : ""
      }
    >
      <div className={trainedModelApp ? styles.TrainedModelAppMetricsPage : ""}>
        <div className={styles.AppMetricsPage}>
          <div className={"SmallCard " + styles.SummaryCardDimentions}>
            <div className={styles.CardHeaderSection}>
              <div className={styles.CardTitle}>
                {isJupyterNotebook ? "Notebook Summary" : "App Summary"}
              </div>
            </div>
            {spin ? (
              <div className={styles.SummarySectionArea}>
                <div className="SpinnerWrapper">
                  <Spinner size="big" />
                </div>
              </div>
            ) : (
              <div className={styles.CardBodySection}>
                <div
                  className={
                    isJupyterNotebook || trainedModelApp
                      ? styles.NoteBookInnerCard
                      : styles.InnerCard
                  }
                >
                  <div className={styles.InnerCardSections}>
                    <div className={styles.InnerContentGrid}>
                      <div className={styles.InnerTitlesStart}>
                        {isJupyterNotebook ? "Notebook Name" : "App Name"}
                      </div>
                      <div className={styles.InnerContentName}>
                        {appInfo.name}
                      </div>
                    </div>
                    <div className={styles.InnerContentGrid}>
                      <div className={styles.InnerTitlesStart}>
                        {isJupyterNotebook ? "Notebook Url" : "App Url"}
                      </div>
                      {appInfo.url ? (
                        <>
                          {redeploy ? (
                            <div
                              className={styles.Redeploy}
                              onClick={handleRedeployApp}
                            >
                              <RedeployICon />
                              <span className={styles.DeployText}>
                                Redeploy App
                              </span>
                            </div>
                          ) : (
                            <div className={styles.InnerContentLink}>
                              <div className={styles.InnerContentLinkText}>
                                <a
                                  href={appInfo.url}
                                  rel="noopener noreferrer"
                                  target="_blank"
                                >
                                  {appInfo.url}
                                </a>
                              </div>
                              <div className={styles.CopierDiv}>
                                <div className={styles.Icons}>
                                  <CopyText onClick={copyUrl} />
                                  {urlChecked === true ? <Checked /> : null}
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {isReverting ? (
                            <Spinner />
                          ) : (
                            <div
                              className={styles.InnerContentWarnText}
                              onClick={() => {
                                regenerate();
                              }}
                            >
                              Click to re-generate url
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <hr />
                  <div className={styles.InnerCardSections}>
                    <div className={styles.InnerContentGrid}>
                      <div className={styles.InnerTitlesMiddle}>
                        {isJupyterNotebook ? "Notebook Status" : "App Status"}
                      </div>
                      <div className={styles.InnerContentStatus}>
                        <AppStatus appStatus={appInfo.status} />
                        <div>
                          {appInfo.status === "disabled" ? (
                            <div className={styles.DeployText}>Disabled</div>
                          ) : appInfo.status === "running" ? (
                            "Ready"
                          ) : (
                            "Down"
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={styles.InnerContentGrid}>
                      <div className={styles.InnerTitlesMiddle}>
                        Date Deployed
                      </div>
                      <div className={styles.InnerContentAge}>
                        {appInfo.age}
                      </div>
                    </div>
                  </div>
                  {!isJupyterNotebook && !trainedModelApp && (
                    <>
                      <hr />
                      <div className={styles.InnerCardSections}>
                        <div className={styles.InnerContentGrid}>
                          <div className={styles.InnerTitlesEnd}>App Alias</div>
                          <div className={styles.InnerContentEnd}>
                            {appInfo.alias}
                          </div>
                        </div>
                        <div className={styles.InnerContentGrid}>
                          <div className={styles.InnerTitlesEnd}>Port</div>
                          <div className={styles.InnerContentEnd}>
                            {appInfo.port}
                          </div>
                        </div>
                      </div>{" "}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className={styles.MetricCardsSection}>
            <Link
              to={{
                pathname: `/projects/${projectID}/apps/${appID}/memory/`,
              }}
            >
              <MetricsCard
                icon={<MemoryIcon />}
                title="Memory"
                className="CardDimensions"
              >
                <LineChartComponent
                  lineDataKey="memory"
                  preview
                  data={formattedMemoryMetrics}
                />
              </MetricsCard>
            </Link>
            <Link
              to={{
                pathname: `/projects/${projectID}/apps/${appID}/cpu/`,
              }}
            >
              <MetricsCard
                icon={<CPUIcon />}
                title="CPU"
                className="CardDimensions"
              >
                <LineChartComponent
                  lineDataKey="cpu"
                  preview
                  data={formattedCPUMetrics}
                />
              </MetricsCard>
            </Link>
            <Link
              to={{
                pathname: `/projects/${projectID}/apps/${appID}/network/`,
              }}
            >
              <MetricsCard
                icon={<NetworkIcon />}
                title="Network"
                className="CardDimensions"
              >
                <LineChartComponent
                  lineDataKey="network"
                  preview
                  data={formattedNetworkMetrics}
                />
              </MetricsCard>
            </Link>
          </div>
          {!trainedModelApp && (
            <div className={styles.LogsSection}>
              <Link
                to={{
                  pathname: `/projects/${projectID}/apps/${appID}/logs/`,
                }}
              >
                <LogsFrame
                  loading={fetchingLogs}
                  data={logs}
                  title={`${appInfo.name} logs`}
                  error={logsError}
                />
              </Link>
            </div>
          )}
          {trainedModelApp && (
            <div className={styles.TrainedModelReadMeSection}>
              <div className={styles.TrainedModelReadMeSectionTabs}>
                <div
                  onClick={() => {
                    setActiveTrainedModelTab("readMe");
                  }}
                  className={
                    activeTrainedModelTab === "readMe"
                      ? styles.TrainedModelReadMeSectionSelectedTab
                      : styles.TrainedModelReadMeSectionUnSelectedTab
                  }
                >
                  ReadMe
                </div>
                <div
                  onClick={() => {
                    setActiveTrainedModelTab("logs");
                  }}
                  className={
                    activeTrainedModelTab === "logs"
                      ? styles.TrainedModelReadMeSectionSelectedTab
                      : styles.TrainedModelReadMeSectionUnSelectedTab
                  }
                >
                  Runtime logs
                </div>
              </div>
              {activeTrainedModelTab === "readMe" ? (
                <div className={styles.TrainedModelReadMeContainer}>
                  <div className={styles.ReadMeTittleText}>
                    {" "}
                    Model Overview{" "}
                  </div>
                  This model is a sophisticated image classification system
                  meticulously engineered to accurately categorise images into
                  predetermined classes. At its core lies a robust convolutional
                  neural network (CNN) architecture, which has been rigorously
                  trained on an extensive dataset of meticulously labeled
                  images. This training process has endowed the model with the
                  ability to extract intricate visual features and patterns,
                  enabling it to discern subtle differences between image
                  categories with remarkable precision.
                  <br />
                  <div className={styles.ReadMeTittleText}>
                    {" "}
                    Training Dataset
                  </div>
                  The model was trained on a vast and diverse dataset comprising
                  millions of images spanning a wide array of categories. This
                  comprehensive dataset ensures that the model has been exposed
                  to a rich variety of visual patterns and has learned to
                  generalise well to unseen images. The dataset was carefully
                  curated to maintain a balanced distribution of images across
                  different classes, preventing biases in the model's
                  predictions.
                  <br />
                  <div className={styles.ReadMeTittleText}>
                    {" "}
                    Usage Instructions
                  </div>
                  <ol>
                    <li>Input:</li>
                    <ul className={styles.TrainedModelUl}>
                      <li>
                        Text Input: Provide a concise and descriptive text
                        representation of the image. The description should
                        capture the essential visual elements of the image, such
                        as objects, colours, and spatial relationships.
                      </li>
                      <li>
                        Image Upload: Directly upload an image file in a
                        supported format (e.g., JPEG, PNG). Ensure that the
                        image is clear and well-lit for optimal results.
                      </li>
                    </ul>
                    <li>Output:</li>
                    <ul className={styles.TrainedModelUl}>
                      <li>
                        The model will process the input and generate a
                        prediction, indicating the most probable category or
                        class to which the image belongs.{" "}
                      </li>
                      <li>
                        The output will also include confidence scores
                        associated with each predicted category, providing
                        insights into the model's certainty about its
                        classification.
                      </li>
                    </ul>
                  </ol>
                  <div className={styles.ReadMeTittleText}>
                    {" "}
                    Example Usage POST{" "}
                  </div>
                  /API/input{" "}
                  <code>{`{ "input": "a tabby cat lounging on a sunny windowsill" }`}</code>
                  In this example, the user provides a text description of the
                  image, which the model will then process to generate a
                  prediction.
                  <br />
                  <div className={styles.ReadMeTittleText}> API Endpoints </div>
                  The model is accessible through a RESTful API, providing
                  flexibility and ease of integration into various applications.
                  The following API endpoints are available:
                  <ul className={styles.TrainedModelUl}>
                    <li>
                      /API/input: This endpoint accepts image input in either
                      text or image format and returns the model's prediction.{" "}
                    </li>
                    <li>
                      /API/model_info: This endpoint provides information about
                      the model, including its architecture, training dataset,
                      and performance metrics.
                    </li>
                  </ul>
                </div>
              ) : (
                <div className={styles.LogsSection}>
                  <Link
                    to={{
                      pathname: `/projects/${projectID}/apps/${appID}/logs/`,
                    }}
                  >
                    <LogsFrame
                      loading={fetchingLogs}
                      data={logs}
                      title={`${appInfo.name} logs`}
                      error={logsError}
                    />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
        {trainedModelApp && (
          <div className={styles.TrainedModelPromptSection}>
            <div className={styles.TrainedModelPromptHeader}>
              <span>Interact with the Model</span>
              <TrainedModel />
            </div>
            <div className={styles.TrainedModelPromptDescription}>
              This section empowers users to engage directly with the model by
              providing input and receiving generated outputs. It serves as the
              primary interface for users to experiment with the model's
              capabilities and explore its potential applications.
            </div>
            <div className={styles.TrainedModelPromptInput}>
              <BlackInputText
                name={trainedModelInput}
                value={trainedModelInput}
                placeholder="Ask me"
                onChange={(e) => {
                  setTrainedModelInput(e.target.value);
                }}
              />
              <PrimaryButton onClick={() => {}}>Compute</PrimaryButton>
            </div>
            <div style={{ marginLeft: "1rem" }}>Output:</div>
            <div className={styles.TrainedModelPromptOutPut}></div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AppMetricsPage;
