import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Spinner from "../../components/Spinner";
import getProjectNetwork, {
  clearProjectNetwork,
} from "../../redux/actions/projectNetwork";
import MetricsCard from "../../components/MetricsCard";
import PeriodSelector from "../../components/Period";
import LineChartComponent from "../../components/LineChart";
import {
  formatNetworkMetrics,
  getCurrentTimeStamp,
  subtractTime,
} from "../../helpers/formatMetrics";
import { getProjectName } from "../../helpers/projectName";
import DashboardLayout from "../../components/Layouts/DashboardLayout";

class ProjectNetworkPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      time: {
        start: 0,
        end: getCurrentTimeStamp(),
        step: "",
      },
      period: "1d",
      showErrorMessage: false,
      dateError: "",
    };
    this.handlePeriodChange = this.handlePeriodChange.bind(this);
    this.fetchNetwork = this.fetchNetwork.bind(this);
    this.getDateCreated = this.getDateCreated.bind(this);
  }

  componentDidMount() {
    const {
      match: { params },
      getProjectNetwork,
      clearProjectNetwork,
    } = this.props;
    const { projectID } = params;
    clearProjectNetwork();
    getProjectNetwork(projectID, { step: "2h" });
  }

  getDateCreated() {
    const {
      match: { params },
      projects,
    } = this.props;
    const { projectID } = params;
    return projects.find((project) => project.id === projectID).date_created;
  }

  async handlePeriodChange(period, customTime = null) {
    let days;
    let step;
    let startTimeStamp;
    let endTimeStamp = getCurrentTimeStamp();

    if (period === "1d") {
      days = 1;
      step = "2h";
    } else if (period === "7d") {
      days = 7;
      step = "1d";
    } else if (period === "1m") {
      days = 30;
      step = "7d";
    } else if (period === "3m") {
      days = 90;
      step = "7d";
    } else if (period === "1y") {
      days = 365;
      step = "1m";
    } else if (period === "custom") {
      step = "1d";
    }

    this.setState({ period }); // this period state will be used to format x-axis values accordingly

    if (period === "all") {
      startTimeStamp = await Date.parse(this.getDateCreated());
      step = "1d"; // TODO: make dynamic depending on the all-time metrics
    } else if (period === "custom" && customTime !== null) {
      startTimeStamp = customTime.start;
      endTimeStamp = customTime.end;
      const { start, end } = customTime;
      if (end <= start) {
        this.setState({
          showErrorMessage: true,
          dateError: "End date must be greater than start date.",
        });
      } else if (endTimeStamp > startTimeStamp) {
        this.setState({
          showErrorMessage: false,
          dateError: "",
        });
      }
    } else {
      startTimeStamp = await subtractTime(getCurrentTimeStamp(), days);
    }

    this.setState((prevState) => ({
      time: {
        ...prevState.time,
        end: endTimeStamp,
        start: startTimeStamp,
        step,
      },
    }));

    if (endTimeStamp > startTimeStamp) {
      this.fetchNetwork();
    }
  }

  fetchNetwork() {
    const { time } = this.state;
    const {
      match: { params },
      getProjectNetwork,
      clearProjectNetwork,
    } = this.props;
    const { projectID } = params;

    clearProjectNetwork();

    getProjectNetwork(projectID, time);
  }

  render() {
    const {
      match: { params },
      isFetchingNetwork,
      networkMetrics,
      projects,
    } = this.props;
    const { projectID } = params;
    const { period } = this.state;

    const formattedMetrics = formatNetworkMetrics(
      projectID,
      networkMetrics,
      period
    );

    return (
      <DashboardLayout
        header="Project Network"
        name={getProjectName(projects, projectID)}
      >
        <MetricsCard
        className="MetricsCardGraph"
        title={
          <div className="PeriodContainer">
             <div className="SelectedContainer"> 
              <PeriodSelector onChange={this.handlePeriodChange} />
              {this.state.period === 'custom' && (
                <>
                  <div className="SelectedDates">
                    {new Date(this.state.time.start).toLocaleString()} - {new Date(this.state.time.end).toLocaleString()}
                  </div>
                </>
              )}
             </div> 
            {this.state.showErrorMessage && (
              <div className="ErrorMessage"> {this.state.dateError}</div>
            )}
          </div>
        }
      >
          
          {isFetchingNetwork ? (
            <div className="ContentSectionSpinner">
              <Spinner />
            </div>
          ) : (
            <LineChartComponent
              yLabel="Network (KBs)"
              xLabel="Time"
              xDataKey="time"
              lineDataKey="network"
              data={formattedMetrics}
            />
          )}
        </MetricsCard>
      </DashboardLayout>
    );
  }
}

ProjectNetworkPage.propTypes = {
  isFetchingNetwork: PropTypes.bool.isRequired,
  networkMetrics: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  getProjectNetwork: PropTypes.func.isRequired,
  clearProjectNetwork: PropTypes.func.isRequired,
  projects: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export const mapStateToProps = (state) => {
  const { isFetchingNetwork, networkMetrics, networkMessage } =
    state.projectNetworkReducer;
  const { projects } = state.userProjectsReducer;
  return {
    projects,
    isFetchingNetwork,
    networkMetrics,
    networkMessage,
  };
};

const mapDispatchToProps = {
  getProjectNetwork,
  clearProjectNetwork,
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectNetworkPage);
