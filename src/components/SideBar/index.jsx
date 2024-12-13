import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styles from "./SideBar.module.css";
import {
  Link,
  NavLink,
  matchPath,
  useParams,
  useLocation,
} from "react-router-dom";
import { ReactComponent as BackButton } from "../../assets/images/arrow-left.svg";
import { ReactComponent as Setting } from "../../assets/images/setting.svg";
// import { ReactComponent as Credit } from "../../assets/images/credit-card.svg";
import { ReactComponent as Clip } from "../../assets/images/clipboard.svg";
import { ReactComponent as Network } from "../../assets/images/wifi.svg";
import { ReactComponent as Disk } from "../../assets/images/server.svg";
import { ReactComponent as Memory } from "../../assets/images/hard-drive.svg";
import { ReactComponent as Database } from "../../assets/images/database.svg";
import { ReactComponent as Experiment } from "../../assets/images/flask-experiment.svg";
import { ReactComponent as AppDeployment } from "../../assets/images/deploymentCopy.svg";
// import { ReactComponent as Activity } from "../../assets/images/activity.svg";
import { ReactComponent as Apps } from "../../assets/images/grid.svg";
import useMedia from "../../hooks/mediaquery";
import Menu from "../../assets/images/menu.svg";
import CloseIcon from "../../assets/images/cancel-icon.svg";

const SideBar = (props) => {
  const { name, appCategory } = props;
  const params = useParams();
  const { projectID, appID } = params;
  const location = useLocation();
  const pageRoute = location.pathname;

  const isAppPage = matchPath(pageRoute, {
    path: "/projects/:projectID/apps/:appID",
    // exact: true,
    strict: true,
  });

  const isDesktop = useMedia();
  const [OpenForsmallScreen, setopenForsmallScreen] = useState(false);
  const BarRef = useRef(null);

  const isAppMetricsPage = matchPath(pageRoute, {
    path: "/projects/:projectID/apps/:appID/",
    exact: false,
    strict: true,
  });
  const handleClickOutsideBar = (event) => {
    if (BarRef.current && !BarRef.current.contains(event.target)) {
      setopenForsmallScreen(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutsideBar);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideBar);
    };
  }, []);

  const HandleMenuClick = () => {
    setopenForsmallScreen(true);
  };

  // const pageLocation = matchPath(pageRoute, {
  //   path: "/projects/:projectID/apps",
  //   exact: true,
  //   strict: true,
  // });

  // const databaseLocation = matchPath(pageRoute, {
  //   path: "/projects/:projectID/databases/:databaseID/settings",
  //   exact: true,
  //   strict: true,
  // });

  return (
    <>
      {isDesktop || OpenForsmallScreen ? (
        <div
          ref={BarRef}
          className={OpenForsmallScreen ? styles.SmallSidebar : styles.SideBar}
        >
          <div>
            {isAppPage ? (
              <Link
                to={{ pathname: `/projects/${projectID}/dashboard` }}
                className={styles.SideBarTopSection}
              >
                <BackButton color="#fff" />
                <div className={styles.SideBarProjectName}>{name}</div>
              </Link>
            ) : (
              <Link
                to={{ pathname: `/projects` }}
                className={styles.SideBarTopSection}
              >
                <BackButton color="#fff" />
                <div className={styles.SideBarProjectName}>{name}</div>
              </Link>
            )}
          </div>

          <div className={styles.SideBarBottomSection}>
            <div className={styles.SideBarLinks}>
              {isAppPage ? (
                <NavLink
                  to={{
                    pathname: `/projects/${projectID}/apps/${appID}/dashboard`,
                  }}
                  className={styles.SubBarListItem}
                >
                  Dashboard
                </NavLink>
              ) : (
                <NavLink
                  to={{ pathname: `/projects/${projectID}/dashboard` }}
                  className={styles.SubBarListItem}
                >
                  Dashboard
                </NavLink>
              )}
              {!isAppPage && (
                <div>
                  <Link
                    to="#"
                    className={`${styles.ListItem} ${styles.DisabledLink}`}
                  >
                    SERVICES
                  </Link>
                  <NavLink
                    to={{ pathname: `/projects/${projectID}/apps` }}
                    className={styles.SubBarListItem}
                  >
                    <Apps /> Apps
                  </NavLink>

                  <NavLink
                    to={`/projects/${projectID}/databases`}
                    className={styles.SubBarListItem}
                  >
                    <Database /> Databases
                  </NavLink>
                </div>
              )}
              <Link
                to="#"
                className={`${styles.ListItem} ${styles.DisabledLink}`}
              >
                METRICS
              </Link>
              <div>
                <NavLink
                  to={
                    isAppPage
                      ? `/projects/${projectID}/apps/${appID}/cpu`
                      : `/projects/${projectID}/cpu`
                  }
                  className={styles.SubBarListItem}
                >
                  <Disk /> CPU
                </NavLink>
                <NavLink
                  to={
                    isAppPage
                      ? `/projects/${projectID}/apps/${appID}/memory`
                      : `/projects/${projectID}/memory`
                  }
                  className={styles.SubBarListItem}
                >
                  <Memory /> Memory
                </NavLink>
                {/* <Link to={storageLink} className={styles.SubBarListItem}>Storage</Link> */}
                <NavLink
                  to={
                    isAppPage
                      ? `/projects/${projectID}/apps/${appID}/network`
                      : `/projects/${projectID}/network`
                  }
                  className={styles.SubBarListItem}
                >
                  <Network /> Network
                </NavLink>
                {(isAppMetricsPage || isAppPage) && (
                  <>
                    <>
                      {appCategory !== "notebook" && (
                        <div>
                          <NavLink
                            to={`/projects/${projectID}/apps/${appID}/logs`}
                            className={styles.SubBarListItem}
                          >
                            {" "}
                            <Clip />
                            Logs
                          </NavLink>
                        </div>
                      )}
                      <Link
                        to="#"
                        className={`${styles.ListItem} ${styles.DisabledLink}`}
                      >
                        OTHER
                      </Link>
                    </>

                    {appCategory === "notebook" && (
                      <>
                        <div>
                          <NavLink
                            to={`/projects/${projectID}/apps/${appID}/experiments`}
                            className={styles.SubBarListItem}
                          >
                            <Experiment style={{ paddingBottom: "0.2rem" }} />
                            Experiments
                          </NavLink>
                        </div>
                        <div>
                          <NavLink
                            to={`/projects/${projectID}/apps/${appID}/deployments`}
                            className={styles.SubBarListItem}
                          >
                            <AppDeployment />
                            Deployments
                          </NavLink>
                        </div>
                      </>
                    )}

                    <div>
                      <NavLink
                        to={{
                          pathname: `/projects/${projectID}/apps/${appID}/settings`,
                          name,
                        }}
                        className={styles.SubBarListItem}
                      >
                        <Setting />
                        App Settings
                      </NavLink>
                    </div>
                  </>
                )}
              </div>

              {isAppPage || isAppMetricsPage ? null : (
                <>
                  <Link
                    to="/"
                    className={`${styles.ListItem} ${styles.DisabledLink}`}
                  >
                    OTHER
                  </Link>
                  {/* <div>
                    <div>
                      <NavLink
                        to={{
                          pathname: `/projects/${projectID}/activity`,
                        }}
                        className={styles.SubBarListItem}
                      >
                        <Activity />
                        Activity
                      </NavLink>
                    </div>
                  </div> */}
                  <div>
                    {/* <div>
                      <NavLink
                        to={{
                          pathname: `/projects/${projectID}/billing`,
                        }}
                        className={styles.SubBarListItem}
                      >
                        <Credit />
                        Billing
                      </NavLink>
                    </div> */}
                  </div>
                  <div>
                    <NavLink
                      to={{
                        pathname: `/projects/${projectID}/settings`,
                      }}
                      className={styles.SubBarListItem}
                    >
                      {" "}
                      <Setting />
                      Project settings
                    </NavLink>
                  </div>
                </>
              )}
            </div>

            <div className={styles.SideBarFooterSection}>
              <div className={`${styles.SideFooter} ${styles.StickBottom}`}>
                Copyright {new Date().getFullYear()} Crane Cloud. All Rights
                Reserved.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={styles.MenuIcon}
          onClick={() => {
            HandleMenuClick();
          }}
        >
          <img src={Menu} alt="menu" />
        </div>
      )}
      {!isDesktop && OpenForsmallScreen && (
        <div
          className="CloseMenuIcon"
          onClick={() => {
            setopenForsmallScreen(false);
          }}
        >
          <img src={CloseIcon} alt="menu" />
        </div>
      )}
    </>
  );
};

// SideBar.defaultProps = {
//   appLogsLink: "",
// };

SideBar.propTypes = {
  name: PropTypes.string,
  // params: PropTypes.shape({}).isRequired,
  // now from a use hook for params
  pageRoute: PropTypes.string,
  // cpuLink: PropTypes.string.isRequired,
  // memoryLink: PropTypes.string.isRequired,
  // databaseLink: PropTypes.string.isRequired,
  // networkLink: PropTypes.string.isRequired,
  // allMetricsLink: PropTypes.string.isRequired,
  // appLogsLink: PropTypes.string,
};

export default SideBar;
