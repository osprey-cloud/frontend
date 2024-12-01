import React, { useEffect, useState } from "react";
import styles from "./NotebookExperimentPage.module.css";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import { handleGetRequest } from "../../apis/apis";

const experimentData = [
  {
    id: 1,
    runName: "adorable-smelt-29",
    created: "7 days ago",
    duration: "15.3s",
    user: "jovyan",
    source: "ipykernel",
    status: "success",
  },
  {
    id: 2,
    runName: "silent-panda-418",
    created: "10 days ago",
    duration: "447ms",
    user: "jovyan",
    source: "ipykernel",
    status: "success",
  },
  {
    id: 3,
    runName: "agreeable-trout-282",
    created: "10 days ago",
    duration: "0.5s",
    user: "jovyan",
    source: "ipykernel",
    status: "success",
  },
  {
    id: 4,
    runName: "enchanting-deer-739",
    created: "10 days ago",
    duration: "15.3s",
    user: "jovyan",
    source: "ipykernel",
    status: "success",
  },
  {
    id: 5,
    runName: "dashing-bee-82",
    created: "12 days ago",
    duration: "14.4s",
    user: "jovyan",
    source: "ipykernel",
    status: "success",
  },
  {
    id: 6,
    runName: "youthful-goat-146",
    created: "12 days ago",
    duration: "6.3min",
    user: "jovyan",
    source: "ipykernel",
    status: "success",
  },
  {
    id: 7,
    runName: "upbeat-bear-644",
    created: "12 days ago",
    duration: "57ms",
    user: "jovyan",
    source: "ipykernel",
    status: "error",
  },
  {
    id: 8,
    runName: "dazzling-swan-3",
    created: "12 days ago",
    duration: "54ms",
    user: "jovyan",
    source: "ipykernel",
    status: "error",
  },
];

const NotebookExperimentPage = () => {
  const { appID } = useParams();

  const [app, setApp] = useState([]);
  const [data, setExperiments] = useState(experimentData);
  const [spin, setSpin] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  // Handle row selection
  const handleSelectRow = (id) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((rowId) => rowId !== id)
        : [...prevSelected, id]
    );
  };

  // Handle deleting selected rows
  const handleDeleteSelected = () => {
    setExperiments(data.filter((row) => !selectedRows.includes(row.id)));
    setSelectedRows([]); // Clear selection
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
    setSpin(true);

    handleGetRequest(`/apps/${appID}`)
      .then((response) => {
        setApp(response.data.data.apps);
        setSpin(false);
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
        header={`${appInfo.name} experiments`}
        appCategory={"notebook"}
        viewAppLink={appInfo.url}
        viewAppLinkText={"+ Create experiment"}
      >
        <div className={styles.AppMetricsPage}>
          <div className={styles.Container}>
            <div className={styles.Header}>
              <div>
                <h1 className={styles.Title}>dorothys-work</h1>
                <p className={styles.Description}>
                  Experiment ID: 1 | Artifact Location: ./mlruns/1
                </p>
              </div>
              <div className={styles.RightDashboardButtons}>
                <button
                  style={styles.deleteButton}
                  onClick={handleDeleteSelected}
                  disabled={selectedRows.length === 0}
                >
                  Delete Selected Rows
                </button>
                <button className={styles.editButton}>Refresh</button>
              </div>
            </div>

            <div className={styles.filters}>
              <input
                type="text"
                placeholder="Search metrics or parameters..."
                className={styles.searchBar}
              />
              <div className={styles.selectGroup}>
                <select>
                  <option>Time created: All time</option>
                </select>
                <select>
                  <option>State: Active</option>
                </select>
              </div>
            </div>

            <div
              className={
                spin ? "ResourcesTable LoadingResourcesTable" : "ResourcesTable"
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
                            e.target.checked ? data.map((row) => row.id) : []
                          )
                        }
                        checked={
                          selectedRows.length === data.length && data.length > 0
                        }
                      />
                    </th>
                    <th>Run Name</th>
                    <th>Created</th>
                    <th>Duration</th>
                    <th>User</th>
                    <th>Source</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr
                      key={index}
                      className={{
                        ...styles.tableCell,
                        ...(index % 2 === 0 ? styles.rowHover : {}),
                      }}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.id)}
                          onChange={() => handleSelectRow(row.id)}
                        />
                      </td>
                      <td>{row.runName}</td>
                      <td>{row.created}</td>
                      <td>{row.duration}</td>
                      <td>{row.user}</td>
                      <td>{row.source}</td>
                      <td>
                        {row.status === "success" ? (
                          <span className={styles.success}>✔</span>
                        ) : (
                          <span className={styles.error}>✘</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default NotebookExperimentPage;
