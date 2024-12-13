import React, { useState, useEffect, useCallback } from "react";
import "./ProjectList.css";
import InformationBar from "../../components/InformationBar";
import Header from "../../components/Header";
import getAdminProjectsList from "../../redux/actions/adminProjectsList";
import Spinner from "../../components/Spinner";
import { useSelector, useDispatch } from "react-redux";
import usePaginator from "../../hooks/usePaginator";
import Pagination from "../../components/Pagination";
import { handleGetRequest } from "../../apis/apis.js";
import { ReactComponent as SearchButton } from "../../assets/images/search.svg";
import { retrieveProjectTypes } from "../../helpers/projecttypes.js";
import { filterGraphData } from "../../helpers/filterGraphData.js";
import { retrieveMonthNames } from "../../helpers/monthNames.js";
import NewResourceCard from "../../components/NewResourceCard";
import Select from "../../components/Select";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import { ReactComponent as BackButton } from "../../assets/images/arrow-left.svg";
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
import { projectLists } from "../../helpers/projectPieCat";
import AppFooter from "../appFooter";

const COLORS = [
  "#0088FE",
  "#0DBC00",
  "#F9991A",
  "#AE0000",
  "#000000",
  "#800080",
];

const AdminProjectsOverview = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  const availableProjectListings = projectLists();

  const { isRetrieved, isRetrieving, projects, pagination } = useSelector(
    (state) => state.adminProjectsReducer
  );

  const [word, setWord] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [sectionValue2, setSectionValue2] = useState("");
  const [currentPage, handleChangePage] = usePaginator();

  const [period, setPeriod] = useState("all");
  const [graphDataArray, setGraphDataArray] = useState([]);
  const projectTypeCounts = {};
  const [projectTypes, setProjectTypes] = useState({});

  let createPieChartData = [];
  let filteredGraphData = [];

  useEffect(() => {
    getProjectsSummary();
  }, []);

  const getProjectsSummary = async () => {
    setLoading(true);

    try {
      const response = await handleGetRequest("/projects?series=true");
      setGraphDataArray(response.data.data.graph_data);
      setProjectTypes(response.data.data.metadata.project_type);
    } catch (error) {
      setFeedback("Failed to fetch project metrics");
    } finally {
      setLoading(false);
    }
  };

  const handleListChange = (selectedOption) => {
    const selectedList = selectedOption.value;
    setSectionValue2(selectedList);
  };

  const AdminProjects = useCallback(
    (page, state = "", keyword = "") =>
      dispatch(getAdminProjectsList(page, keyword, state)),
    [dispatch]
  );

  const handleProjectFilterAndFetch = useCallback(
    (page, keyword = "") => {
      if (sectionValue2 === "Disabled Projects") {
        AdminProjects(page, "true", keyword);
      } else if (sectionValue2 === "Active Projects") {
        AdminProjects(page, "false", keyword);
      } else {
        AdminProjects(page, "", keyword);
      }
    },
    [AdminProjects, sectionValue2]
  );

  useEffect(() => {
    handleProjectFilterAndFetch(currentPage);
  }, [sectionValue2, currentPage, handleProjectFilterAndFetch]);

  useEffect(() => {
    handleProjectFilterAndFetch(currentPage);
  }, [handleProjectFilterAndFetch, currentPage]);

  // these function calls will filter the first & second graph data basing on a particular period
  filteredGraphData = filterGraphData(graphDataArray, period);

  const handleChange = ({ target }) => {
    setPeriod(target.getAttribute("value"));
  };

  const allowedProjectTypes = retrieveProjectTypes().map((type) => type.value);

  // Filter and count allowed project types
  Object.keys(projectTypes).forEach((key) => {
    // Normalize case for comparison
    const normalizedKey =
      key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
    if (allowedProjectTypes.includes(normalizedKey)) {
      if (!projectTypeCounts[normalizedKey]) {
        projectTypeCounts[normalizedKey] = 0;
      }
      projectTypeCounts[normalizedKey] += projectTypes[key];
    }
  });

  // Calculate "Others"
  const othersCount = Object.keys(projectTypes).reduce((count, key) => {
    const normalizedKey =
      key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
    return allowedProjectTypes.includes(normalizedKey)
      ? count
      : count + projectTypes[key];
  }, 0);

  if (othersCount > 0) {
    projectTypeCounts["Others"] = othersCount;
  }

  const searchThroughProjects = (keyword) => {
    handleChangePage(1);
    handleProjectFilterAndFetch(1, keyword);
  };

  const handleCallbackSearchword = ({ target }) => {
    const { value } = target;
    setWord(value);
    if (value !== "") {
      searchThroughProjects(value);
    }
    if (value === "") {
      handleChangePage(1);
      handleProjectFilterAndFetch(1);
    }
  };

  const handlePageChange = (currentPage) => {
    handleChangePage(currentPage);
    handleProjectFilterAndFetch(currentPage);
  };

  createPieChartData = () => {
    const degrees = {};
    if (!projectTypeCounts) {
      return [];
    }
    const totalCount = Object.values(projectTypeCounts).reduce(
      (total, count) => total + count,
      0
    );
    for (const type in projectTypeCounts) {
      const count = projectTypeCounts[type];
      const degree = (count / totalCount) * 100;
      degrees[type] = degree.toFixed(1);
    }
    const pieChartData = Object.entries(degrees).map(([type, degrees]) => ({
      category: type,
      value: parseFloat(degrees),
    }));
    return pieChartData;
  };

  createPieChartData();

  return (
    <div className="APage">
      <div className="TopRow">
        <Header />
        <InformationBar
          header={
            <span className="ProjectsInformationBarTitle">
              <Link className={`breadcrumb flex_back_link`} to={`/clusters`}>
                <BackButton />
                <div className="back_link">Project Listing</div>
              </Link>
            </span>
          }
          showBtn={false}
        />
      </div>
      <div className="AMainSection">
        <div className="ContentSection">
          <div className="TitleArea">
            <div className="SectionTitle">Project Categories</div>
          </div>
          {loading ? (
            <div className="ResourceSpinnerWrapper">
              <Spinner size="big" />
            </div>
          ) : feedback !== "" ? (
            <div className="NoResourcesMessage">{feedback}</div>
          ) : Object.keys(projectTypeCounts).length > 0 ? (
            <div className="ResourceClusterContainer">
              {Object.keys(projectTypeCounts).map((projectType) => (
                <NewResourceCard
                  key={projectType}
                  title={projectType}
                  count={projectTypeCounts[projectType]}
                />
              ))}
            </div>
          ) : null}

          <div className="TitleArea">
            <div className="SectionTitle">
              Project Categories And PieChart Summary
            </div>
          </div>
          <div className="ChartContainer">
            <div className="VisualArea">
              <div className="VisualAreaContentSection">
                <div className="VisualAreaHeader">
                  <span className="SectionTitle">Projects</span>
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
              </div>
              <div className="ChartsArea">
              {graphDataArray.length !==0 ?(
                <AreaChart
                  width={550}
                  height={380}
                  syncId="anyId"
                  data={period !=="all"? filteredGraphData : graphDataArray}
                >
                  <Line type="monotone" dataKey="Value" stroke="#8884d8" />
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="month" />
                  <XAxis
                    xAxisId={1}
                    dx={10}
                    label={{
                      value: "Time",
                      angle: 0,
                      position: "bottom",
                    }}
                    interval={12}
                    dataKey="year"
                    tickLine={false}
                    tick={{ fontSize: 12, angle: 0 }}
                  />
                  <CartesianGrid strokeDasharray="3 3" />
                  <YAxis
                    label={{
                      value: "Number of Projects",
                      angle: 270,
                      position: "outside",
                    }}
                    width={100}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
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
                            if (value===1){
                              return [`${value} project`];
                            }
                            else{
                            return [`${value} projects`];
                            }
                          }}
                        />
                </AreaChart>
                ):(
                  <div className="ResourceSpinnerWrapper">
                  <Spinner size="big" />
                </div>
                )}
              </div>
            </div>

            <div className="VisualArea">
              {Object.keys(projectTypeCounts).length === 0 ? (
                <div className="ResourceSpinnerWrapper">
                  <Spinner size="big" />
                </div>
              ) : Object.keys(projectTypeCounts).length !== 0 ? (
                <>
                  <div className="PieContainer">
                    <div className="ChartColumn">
                      <PieChart width={300} height={300}>
                        <Pie
                          data={createPieChartData()}
                          dataKey="value"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={140}
                          paddingAngle={3}
                          fill="#8884d8"
                        >
                          {createPieChartData().map((entry, index) => (
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
                        {createPieChartData().map((entry, index) => (
                          <>
                            <li key={`list-item-${index}`}>
                              <span
                                style={{ color: COLORS[index % COLORS.length] }}
                              >
                                {entry.category} :{" "}
                              </span>
                              {entry.value} %
                            </li>
                            <hr style={{ width: "100%" }} />
                          </>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div className="TitleArea">
            <div className="SectionTitle">
              <span>
                <Select
                  placeholder="Projects Listing"
                  options={availableProjectListings}
                  onChange={(selectedOption) =>
                    handleListChange(selectedOption)
                  }
                />
              </span>
              <span>
                <div className="XSearchBar">
                  <div className="AdminSearchInput">
                    <input
                      type="text"
                      className="searchTerm"
                      name="Searchword"
                      placeholder="Search for project"
                      value={word}
                      onChange={(e) => {
                        handleCallbackSearchword(e);
                      }}
                    />
                    <SearchButton className="SearchIcon" />
                  </div>
                </div>
              </span>
            </div>
          </div>

          <div className="ContentSection">
            <div className="ResourceTable">
              <div
                className={
                  isRetrieving
                    ? "ResourcesTable LoadingResourcesTable"
                    : "ResourcesTable"
                }
              >
                <table>
                  <thead className="uppercase">
                    <tr>
                      <th>name</th>
                      <th>description</th>
                      <th>status</th>
                    </tr>
                  </thead>
                  {isRetrieving ? (
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
                      {isRetrieved &&
                        projects !== undefined &&
                        projects.map((project) => (
                          <tr
                            onClick={() => {
                              history.push(
                                `/projects-overview/${project.id}/details`
                              );
                            }}
                            key={projects.indexOf(project)}
                          >
                            <td>{project?.name}</td>
                            <td>{project?.description}</td>
                            <td>
                              <span
                                className={
                                  project?.disabled === false
                                    ? "ProjectStatus"
                                    : "ProjectStatusDisabled"
                                }
                              >
                                {project?.disabled === false
                                  ? "Active"
                                  : "Disabled"}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  )}
                </table>
                {isRetrieved && projects.length === 0 && (
                  <div className="AdminNoResourcesMessage">
                    <p>No projects available</p>
                  </div>
                )}
                {!isRetrieving && !isRetrieved && (
                  <div className="AdminNoResourcesMessage">
                    <p>
                      Oops! Something went wrong! Failed to retrieve projects.
                    </p>
                  </div>
                )}
              </div>
            </div>
            {pagination?.pages > 1 && (
              <div className="AdminPaginationSection">
                <Pagination
                  total={pagination.pages}
                  current={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <AppFooter />
    </div>
  );
};

export default AdminProjectsOverview;
