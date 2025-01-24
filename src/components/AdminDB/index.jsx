import React, { useEffect, useState, useCallback } from "react";
import Header from "../Header";
import InformationBar from "../InformationBar";
import Spinner from "../Spinner";
import CreateAdminDB from "./CreateAdminDB";
import tellAge from "../../helpers/ageUtility";
import adminGetDatabases from "../../redux/actions/getAdminDatabases";
// import styles from "./AdminDB.module.css";
import usePaginator from "../../hooks/usePaginator";
import Pagination from "../../components/Pagination";
import { useSelector, useDispatch } from "react-redux";
import NewResourceCard from "../NewResourceCard";
import {
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { createDatabasesPieChartData } from "../../helpers/databasesPieChartData";
import { createDatabaseGraphData } from "../../helpers/databasesGraphData";
import { filterGraphData } from "../../helpers/filterGraphData";
import { retrieveMonthNames } from "../../helpers/monthNames";
import Select from "../Select";
import { getDatabaseFlavors } from "../../helpers/databaseCategories";
import { useHistory, Link } from "react-router-dom/cjs/react-router-dom.min";
import { ReactComponent as BackButton } from "../../assets/images/arrow-left.svg";
import AppFooter from "../appFooter";
import {
  useAdminDatabaseList,
  useAdminDatabaseStats,
} from "../../hooks/useDatabases";

const AdminDBList = () => {
  const history = useHistory();
  // const [currentPage, handleChangePage] = usePaginator();
  // const [feedback, setFeedback] = useState("");
  const [openCreateComponent, setOpenCreateComponent] = useState(false);
  // const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("all");
  const [sectionValue, setSectionValue] = useState("");

  const { data: databaseStats, isLoading: isLoadingDatabaseStats } =
    useAdminDatabaseStats();

  const { data: response, isLoading: isLoadingDatabases } =
    useAdminDatabaseList(sectionValue);

  const COLORS = ["#0088FE", "#0DBC00"];

  let graphDataArray = [];
  let filteredGraphData = [];

  const { isCreated } = useSelector((state) => state.adminCreateDBReducer);

  useEffect(() => {
    callbackCreateComponent();
  }, [isCreated]);

  const showCreateComponent = () => {
    setOpenCreateComponent(true);
  };

  const callbackCreateComponent = () => {
    setOpenCreateComponent(false);
  };

  // const sortedDbs = databases.sort((a, b) =>
  //   b.date_created > a.date_created ? 1 : -1
  // );

  const handleChange = ({ target }) => {
    setPeriod(target.getAttribute("value"));
  };

  const handleSectionChange = (selectedOption) => {
    const selectedValue = selectedOption.value;
    setSectionValue(selectedValue);
  };

  // filteredGraphData = filterGraphData(graphDataArray, period);

  const availableFlavors = getDatabaseFlavors();

  return (
    <div className="APage">
      <Header />
      {openCreateComponent ? (
        <CreateAdminDB closeComponent={callbackCreateComponent} />
      ) : (
        <>
          <div className="TopRow">
            <InformationBar
              header={
                <span className="ProjectsInformationBarTitle">
                  <Link
                    className={`breadcrumb flex_back_link`}
                    to={`/clusters`}
                  >
                    <BackButton />
                    <div className="back_link">Databases Overview</div>
                  </Link>
                </span>
              }
              showBtn
              buttontext="+ new database"
              btnAction={showCreateComponent}
            />
          </div>

          <div className="AMainSection">
            <div className="ContentSection">
              <div className="TitleArea">
                <div className="SectionTitle">Databases Summary</div>
              </div>
              {isLoadingDatabaseStats || isLoadingDatabases ? (
                <div className="ResourceSpinnerWrapper">
                  <Spinner size="big" />
                </div>
              ) : databaseStats.data?.data?.databases?.total_database_count >
                0 ? (
                <div className="ResourceClusterContainer">
                  <NewResourceCard
                    title={"Total"}
                    count={
                      databaseStats.data?.data?.databases?.total_database_count
                    }
                  />

                  <NewResourceCard
                    title={"MySQL"}
                    count={
                      databaseStats.data?.data?.databases?.dbs_stats_per_flavour
                        ?.mysql_db_count
                    }
                  />

                  <NewResourceCard
                    title={"PostgreSQL"}
                    count={
                      databaseStats.data?.data?.databases?.dbs_stats_per_flavour
                        ?.postgres_db_count
                    }
                  />
                </div>
              ) : null}

              <div className="TitleArea">
                <div className="SectionTitle">
                  Graph and Pie Chart Summary on Databases
                </div>
              </div>
              <div className="ChartContainer">
                <div className="VisualArea">
                  <div className="VisualAreaHeader">
                    <span className="SectionTitle">Platform Databases</span>
                    <span>
                      <div className="PeriodContainer">
                        <div className="PeriodButtonsSection">
                          <div
                            className={`${
                              period === "3" && "PeriodButtonActive"
                            } PeriodButton`}
                            name="3month"
                            value="3"
                            role="presentation"
                            onClick={handleChange}
                          >
                            3m
                          </div>
                          <div
                            className={`${
                              period === "4" && "PeriodButtonActive"
                            } PeriodButton`}
                            name="4months"
                            value="4"
                            role="presentation"
                            onClick={handleChange}
                          >
                            4m
                          </div>
                          <div
                            className={`${
                              period === "6" && "PeriodButtonActive"
                            } PeriodButton`}
                            name="6months"
                            value="6"
                            role="presentation"
                            onClick={handleChange}
                          >
                            6m
                          </div>
                          <div
                            className={`${
                              period === "8" && "PeriodButtonActive"
                            } PeriodButton`}
                            name="8months"
                            value="8"
                            role="presentation"
                            onClick={handleChange}
                          >
                            8m
                          </div>
                          <div
                            className={`${
                              period === "12" && "PeriodButtonActive"
                            } PeriodButton`}
                            name="1year"
                            value="12"
                            role="presentation"
                            onClick={handleChange}
                          >
                            1y
                          </div>
                          <div
                            className={`${
                              period === "all" && "PeriodButtonActive"
                            } PeriodButton`}
                            name="all"
                            value="all"
                            role="presentation"
                            onClick={handleChange}
                          >
                            all
                          </div>
                        </div>
                      </div>
                    </span>
                  </div>
                  {graphDataArray.length > 0 ? (
                    <AreaChart
                      width={600}
                      height={350}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 0,
                        bottom: 0,
                      }}
                      syncId="anyId"
                      data={
                        period !== "all" ? filteredGraphData : graphDataArray
                      }
                    >
                      <Line type="monotone" dataKey="Value" stroke="#8884d8" />
                      <CartesianGrid stroke="#ccc" />
                      <XAxis dataKey="Month" />
                      <XAxis
                        xAxisId={1}
                        dx={10}
                        label={{
                          value: "Months",
                          angle: 0,
                          position: "outside",
                        }}
                        height={70}
                        interval={12}
                        dataKey="Year"
                        tickLine={false}
                        tick={{ fontSize: 12, angle: 0 }}
                      />
                      <CartesianGrid strokeDasharray="3 3" />
                      <YAxis
                        label={{
                          value: "Number of Databases",
                          angle: 270,
                          position: "outside",
                        }}
                        width={80}
                      />
                      <Area
                        type="monotone"
                        dataKey="Value"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                      />
                      <Tooltip
                        labelFormatter={(value) => {
                          const monthNames = retrieveMonthNames();
                          const month = parseInt(value) - 1;
                          return monthNames[month].name;
                        }}
                        formatter={(value) => {
                          if (value === 1) {
                            return [`${value} database`];
                          } else {
                            return [`${value} databases`];
                          }
                        }}
                      />
                    </AreaChart>
                  ) : (
                    <div className="ResourceSpinnerWrapper">
                      <Spinner size="big" />
                    </div>
                  )}
                </div>

                <div className="VisualArea">
                  <div className="VisualAreaHeader">
                    <span className="SectionTitle">
                      Pie Chart for Database Flavors
                    </span>
                  </div>
                  {isLoadingDatabaseStats ? (
                    <div className="ResourceSpinnerWrapper">
                      <Spinner size="big" />
                    </div>
                  ) : (
                    <div className="PieContainer">
                      <div className="ChartColumn">
                        <PieChart width={300} height={300}>
                          <Pie
                            data={createDatabasesPieChartData(
                              databaseStats.data?.data?.databases
                                ?.dbs_stats_per_flavour
                            )}
                            dataKey="value"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            outerRadius={140}
                            paddingAngle={3}
                          >
                            {createDatabasesPieChartData(
                              databaseStats.data?.data?.databases
                                ?.dbs_stats_per_flavour
                            ).map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </div>
                      <div className="PercentageColumn">
                        <ul className="KeyItems">
                          {createDatabasesPieChartData(
                            databaseStats.data?.data?.databases
                              ?.dbs_stats_per_flavour
                          ).map((entry, index) => (
                            <>
                              {" "}
                              <li key={`list-item-${index}`}>
                                <span
                                  style={{
                                    color: COLORS[index % COLORS.length],
                                  }}
                                >
                                  {entry.category}:
                                </span>{" "}
                                {(
                                  (entry.value /
                                    databaseStats.data.data.databases
                                      .total_database_count) *
                                  100
                                ).toFixed(0)}
                                %
                              </li>
                              <hr style={{ width: "100%" }} />
                            </>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="TitleArea">
                <div className="SectionTitle">
                  <span>Databases Listing</span>
                  <span>
                    <Select
                      placeholder="All Databases"
                      options={availableFlavors}
                      onChange={(selectedOption) =>
                        handleSectionChange(selectedOption)
                      }
                    />
                  </span>
                </div>
              </div>

              <div
                className={
                  isLoadingDatabases
                    ? "ResourcesTable LoadingResourcesTable"
                    : "ResourcesTable"
                }
              >
                <table className="UsersTable">
                  <thead className="uppercase">
                    <tr>
                      <th>Database Flavor</th>
                      <th>Name</th>
                      <th>Host</th>
                      <th>Age</th>
                    </tr>
                  </thead>
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
                      {response?.data?.data?.databases?.map((database) => (
                        <tr
                          key={database?.id}
                          onClick={() => {
                            history.push(`/databases/${database?.id}`);
                          }}
                        >
                          <td>{database?.database_flavour_name}</td>
                          <td>{database?.name}</td>
                          <td>{database?.host}</td>
                          <td>{tellAge(database?.date_created)}</td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>
                {response?.data?.data?.databases?.length === 0 && (
                  <div className="AdminNoResourcesMessage">
                    <p>No Databases Available</p>
                  </div>
                )}
                {!isLoadingDatabases &&
                  response?.data?.data?.databases?.length === 0 && (
                    <div className="AdminNoResourcesMessage">
                      <p>
                        Oops! Something went wrong! Failed to retrieve Available
                        Databases.
                      </p>
                    </div>
                  )}
              </div>
              {/* {pagination?.pages > 1 && (
                <div className="AdminPaginationSection">
                  <Pagination
                    total={pagination.pages}
                    current={currentPage}
                    onPageChange={handlePageChange}
                  />
                </div>
              )} */}
            </div>
          </div>
        </>
      )}
      <AppFooter />
    </div>
  );
};

export default AdminDBList;
