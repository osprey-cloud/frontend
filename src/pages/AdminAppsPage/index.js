import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import getAppsList from "../../redux/actions/adminApps";
import { getAppCategories } from "../../helpers/getAppCategories";
import Header from "../../components/Header";
import InformationBar from "../../components/InformationBar";
import { handleGetRequest } from "../../apis/apis.js";
import Select from "../../components/Select";
import {
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  Tooltip,
} from "recharts";
import NewResourceCard from "../../components/NewResourceCard";
import "./AdminAppsPage.css";
import { ReactComponent as SearchButton } from "../../assets/images/search.svg";
import AppListing from "../../components/AppListing";
import usePaginator from "../../hooks/usePaginator";
import Spinner from "../../components/Spinner";
import AppFooter from "../../components/appFooter";
import { ReactComponent as BackButton } from "../../assets/images/arrow-left.svg";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import { filterGraphData } from "../../helpers/filterGraphData.js";
import { retrieveMonthNames } from "../../helpers/monthNames.js";

const AdminAppsPage = () => {
  // const [apps, setApps] = useState([]);
  const [appTotal, setAppTotal] = useState([]);
  const [appGraphData, setAppGraphData] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("all");
  //sectionValue will be set when being used
  const [, setSectionValue] = useState("all");
  const [word, setWord] = useState("");
  const [currentPage, handleChangePage] = usePaginator();
  const dispatch = useDispatch();

  let filteredGraphData = [];

  useEffect(() => {
    getAllApps();
  }, []);

  const getAllApps = async () => {
    setLoading(true);

    try {
      const response = await handleGetRequest("/apps?series=true");
      setAppGraphData(response.data.data.graph_data);
      setAppTotal(response.data.data.metadata.total_apps);
      //not sure what this was for but it doesn't seem relevant
      // if (response.data.data.graph_data > 0) {
      //   //const totalNumberOfApps = response.data.data.pagination.total;
      //   handleGetRequest(`/apps?per_page=10`)
      //     .then((response) => {
      //       if (response.data.data.apps.length > 0) {
      //         setApps(response.data.data.apps);
      //         setLoading(false);

      //       } else {
      //         throw new Error("No Apps found");
      //       }
      //     })
      //     .catch(() => {
      //       setFeedback("Failed to fetch all apps, please try again");
      //     });
      // } else {
      //   setFeedback("No Apps found");
      // }
    } catch (error) {
      setFeedback("Failed to fetch Apps metrics");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = ({ target }) => {
    setPeriod(target.getAttribute("value"));
  };

  const availableAppCategories = getAppCategories();

  const handleSectionChange = (selectedOption) => {
    const selectedValue = selectedOption.value;
    setSectionValue(selectedValue);
  };

  const gettingApps = useCallback(
    (page, keyword = "") => dispatch(getAppsList(page, keyword)),
    [dispatch]
  );

  const searchThroughAccounts = (keyword) => {
    // use api
    handleChangePage(1);
    gettingApps(1, keyword);
  };

  const handleCallbackSearchword = ({ target }) => {
    const { value } = target;
    setWord(value);
    if (value !== "") {
      searchThroughAccounts(value);
    }
    if (value === "") {
      // setSearchList([]);
      handleChangePage(1);
      gettingApps(1);
    }
  };

  const handlePageChange = (currentPage) => {
    handleChangePage(currentPage);
    gettingApps();
  };

  // calling the filterGraphData() to filter basing on period
  filteredGraphData = filterGraphData(appGraphData, period);

  console.log("filtered", filterGraphData);

  return (
    <div className="APage">
      <div className="TopRow">
        <Header />
        <InformationBar
          header={
            <span className="ProjectsInformationBarTitle">
              <Link className={`breadcrumb flex_back_link`} to={`/clusters`}>
                <BackButton />
                <div className="back_link">Apps Overview</div>
              </Link>
            </span>
          }
        />
      </div>
      <div className="AMainSection">
        <div className="ContentSection">
          <div className="TitleArea">
            <div className="SectionTitle">Apps Summary</div>
          </div>
          {loading ? (
            <div className="ResourceSpinnerWrapper">
              <Spinner size="big" />
            </div>
          ) : feedback !== "" ? (
            <div className="NoResourcesMessage">{feedback}</div>
          ) : (
            <div className="ResourceClusterContainer">
              <NewResourceCard title="Total Apps" count={appTotal} />
              <NewResourceCard
                title="Running Apps"
                count={Math.floor(appTotal * 0.9)}
              />
              <NewResourceCard
                title="Down Apps"
                count={Math.floor(appTotal * 0.1)}
              />
            </div>
          )}

          <div className="TitleArea">
            <div className="SectionTitle">Graph Summary on Deployments</div>
          </div>

          <div className="AppChartContainer">
            <div className="VisualArea">
              <div className="VisualAreaHeader">
                <span className="SectionTitle">Apps</span>
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
              {appGraphData.length !== 0 ? (
                <AreaChart
                  width={840}
                  height={350}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                  syncId="anyId"
                  data={period !== "all" ? filteredGraphData : appGraphData}
                >
                  <Line type="monotone" dataKey="Value" stroke="#8884d8" />
                  <CartesianGrid stroke="#ccc" />
                  <XAxis dataKey="month" />
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
                    dataKey="year"
                    tickLine={false}
                    tick={{ fontSize: 12, angle: 0 }}
                  />
                  <CartesianGrid strokeDasharray="3 3" />
                  <YAxis
                    label={{
                      value: "Number of Apps",
                      angle: 270,
                      position: "outside",
                    }}
                    width={80}
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
                      if (value === 1) {
                        return [`${value} app`];
                      } else {
                        return [`${value} apps`];
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
                <span className="SectionTitle">Apps Progress Status</span>
              </div>
              <div className="AppDivision">
                <div className="AppMetricItems">
                  <div class="progress">
                    <div
                      class="progress-bar adminAppTotal"
                      role="progressbar"
                      aria-valuenow="70"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      <span class="sr-only">100%</span>
                    </div>
                  </div>

                  <div class="progress">
                    <div
                      class="progress-bar adminAppUpTotal"
                      role="progressbar"
                      aria-valuenow="70"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      <span class="sr-only">90% </span>
                    </div>
                  </div>

                  <div class="progress">
                    <div
                      class="progress-bar adminAppDownTotal"
                      role="progressbar"
                      aria-valuenow="70"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      <span class="sr-only">10%</span>
                    </div>
                  </div>
                </div>
                <div className="cubeContainer">
                  <div class="cubeList">
                    <div class="cube appDown"></div>
                    <div className="">Down Apps</div>
                  </div>

                  <div class="cubeList">
                    <div class="cube appRunning"></div>
                    <div className="">Running Apps</div>
                  </div>

                  <div class="cubeList">
                    <div class="cube appTotal"></div>
                    <div className="">Total Apps</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="TitleArea">
            <div className="SectionTitle">
              <span>
                <Select
                  placeholder="Apps Listing"
                  options={availableAppCategories}
                  onChange={(selectedOption) =>
                    handleSectionChange(selectedOption)
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
                      placeholder="Search for app"
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
          {/* {sectionValue === "active" ? } */}
          <AppListing
            gettingApps={gettingApps}
            handlePageChange={handlePageChange}
            currentPage={currentPage}
          />
        </div>
      </div>
      <AppFooter />
    </div>
  );
};

export default AdminAppsPage;
