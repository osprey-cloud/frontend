import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ReactComponent as ButtonPlus } from "../../assets/images/buttonplus.svg";
import Spinner from "../Spinner";
import Status from "../Status";
import CreateDatabase from "../CreateDatabase";
import styles from "./DatabaseList.module.css";
import DashboardLayout from "../Layouts/DashboardLayout";
import { getProjectName } from "../../helpers/projectName";
import { getRelativeTime } from "../../helpers/ageUtility";
import usePaginator from "../../hooks/usePaginator";
import Pagination from "../Pagination";
import { useDatabaseList } from "../../hooks/useDatabases";

const DatabaseList = ({ match }) => {
  const [currentPage, handleChangePage] = usePaginator();
  const [currentPaginationPage, setCurrentPaginationPage] = useState(1);

  const { projects } = useSelector((state) => state.userProjectsReducer);
  const [openCreateComponent, setOpenCreateComponent] = useState(false);
  const { projectID } = match.params;

  const { data: response, isLoading: isLoadingDatabases } = useDatabaseList(
    "",
    currentPaginationPage,
    projectID
  );

  const showCreateComponent = () => {
    setOpenCreateComponent(true);
  };

  const callbackCreateComponent = () => {
    setOpenCreateComponent(false);
  };

  const sortedDbs = response?.data?.data?.databases?.sort((a, b) =>
    b.date_created > a.date_created ? 1 : -1
  );

  const handlePageChange = (currentPage) => {
    handleChangePage(currentPage);
    setCurrentPaginationPage(currentPage);
  };

  return (
    <div>
      {openCreateComponent ? (
        <DashboardLayout
          header="Create Database"
          showBtn
          buttontext="close"
          btnAction={callbackCreateComponent}
          btntype="close"
          name={getProjectName(projects, projectID)}
        >
          <CreateDatabase params={match.params} />
        </DashboardLayout>
      ) : (
        <DashboardLayout
          header="Databases"
          showBtn
          buttontext="+ new database"
          btnAction={showCreateComponent}
          name={getProjectName(projects, projectID)}
        >
          <div
            className={
              isLoadingDatabases
                ? "ResourcesTable LoadingResourcesTable"
                : "ResourcesTable"
            }
          >
            <table className="PodsTable">
              {response?.data?.data?.databases?.length > 0 && (
                <thead className="uppercase">
                  <tr>
                    <th>Type</th>
                    <th>Name</th>
                    <th>Host</th>
                    <th>Status</th>
                    <th>Age</th>
                  </tr>
                </thead>
              )}
              {isLoadingDatabases ? (
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
                  {sortedDbs?.map((database, index) => (
                    <tr key={index}>
                      <td>
                        <Link
                          to={`/projects/${projectID}/databases/${database.id}/settings`}
                          className={styles.DatabaseLink}
                        >
                          {database.database_flavour_name}
                        </Link>
                      </td>
                      <td>
                        <Link
                          to={`/projects/${projectID}/databases/${database.id}/settings`}
                          className={styles.DatabaseLink}
                        >
                          {database.name}
                        </Link>
                      </td>
                      <td>
                        <Link
                          to={`/projects/${projectID}/databases/${database.id}/settings`}
                          className={styles.DatabaseLink}
                        >
                          {database.host}
                        </Link>
                      </td>
                      <td>
                        <Link
                          to={`/projects/${projectID}/databases/${database.id}/settings`}
                          className={styles.DatabaseLink}
                        >
                          <Status status={!database.disabled} />
                        </Link>
                      </td>
                      <td>
                        <Link
                          to={`/projects/${projectID}/databases/${database.id}/settings`}
                          className={styles.DatabaseLink}
                        >
                          {getRelativeTime(database.date_created)}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>

            {response?.data?.data?.databases?.length === 0 && (
              <table className="PodsTable">
                {isLoadingDatabases ? (
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
                  sortedDbs?.length === 0 && (
                    <div className={styles.NoResourcesMessageSection}>
                      <div className={styles.NoResourcesMessage}>
                        You haven't created any databases yet.
                      </div>
                      <br></br>
                      <div className={styles.NoResourcesMessage}>
                        Click the &nbsp;{" "}
                        <ButtonPlus
                          className={styles.ButtonPlusSmall}
                          onClick={showCreateComponent}
                        />{" "}
                        &nbsp; button to create one.
                      </div>
                    </div>
                  )
                )}
              </table>
            )}
            {response?.data?.data?.pagination?.pages > 1 && (
              <div className="AdminPaginationSection">
                <Pagination
                  total={response?.data?.data?.pagination?.pages}
                  current={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </DashboardLayout>
      )}
    </div>
  );
};

export default DatabaseList;
