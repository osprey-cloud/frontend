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
import DashboardLayout from "../../components/Layouts/DashboardLayout";

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
  const [spin, setSpin] = useState(false);
  const [isJupyterNotebook, setIsJupyterNotebook] = useState(false);

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
        console.error(error?.response?.data?.message);
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
      appCategory={isJupyterNotebook ? "notebook" : ""}
      viewAppLink={appInfo.url}
      viewAppLinkText={isJupyterNotebook ? "Open Notebook" : ""}
    >
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
                    <div className={styles.InnerContentAge}>{appInfo.age}</div>
                  </div>
                </div>
                {!isJupyterNotebook && (
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
        {!spin && !isJupyterNotebook && (
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
    </DashboardLayout>
  );
};

export default AppMetricsPage;
