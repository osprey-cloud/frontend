import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import getAppsList from "../../redux/actions/appsList";
import { ReactComponent as ButtonPlus } from "../../assets/images/buttonplus.svg";
import AppsCard from "../AppsCard";
import Spinner from "../Spinner";
import styles from "./AppsList.module.css";
import Pagination from "../Pagination";

class AppsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rerender: false,
      // Searchword: props.word,
      // SearchList: [],
      currentPaginationPage: 1,
      appsPerPage: 8,
    };

    this.renderAfterDelete = this.renderAfterDelete.bind(this);
    this.searchThroughApps = this.searchThroughApps.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.onPageChange = this.onPageChange.bind(this);
  }

  componentDidMount() {
    const {
      params: { projectID },
      getAppsList,
    } = this.props;
    const { currentPaginationPage, appsPerPage } = this.state;
    getAppsList(projectID, currentPaginationPage, appsPerPage);
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      params: { projectID },
      getAppsList,
      word,
    } = this.props;
    const { rerender, currentPaginationPage, appsPerPage } = this.state;

    if (rerender !== prevState.rerender) {
      getAppsList(projectID, currentPaginationPage, appsPerPage);
    }
    if (word !== prevProps.word) {
      this.searchThroughApps();
    }
  }

  searchThroughApps() {
    const {
      getAppsList,
      word,
      params: { projectID },
    } = this.props;
    const { appsPerPage } = this.state;
    //reset pagination
    this.setState({ currentPaginationPage: 1 });

    getAppsList(projectID, 1, appsPerPage, word);
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  renderAfterDelete() {
    const { rerender } = this.state;
    this.setState({
      rerender: !rerender,
    });
  }
  onPageChange(page) {
    const {
      getAppsList,
      params: { projectID },
    } = this.props;
    this.setState({
      currentPaginationPage: page,
    });
    getAppsList(projectID, page, this.state.appsPerPage);
  }

  render() {
    // const {SearchList} = this.state;
    const {
      apps,
      isRetrieved,
      isRetrieving,
      params,
      word,
      message,
      openComponent,
    } = this.props;
    const allApps = apps.apps;
    const sortedApps = allApps?.sort((a, b) =>
      b.date_created < a.date_created ? 1 : -1
    );

    return (
      <div>
        {isRetrieving ? (
          <div
            className={`${styles.NoAppsResourcesMessage} ${styles.Spinnerheight}`}
          >
            <div className={styles.SpinnerWrapper}>
              <Spinner size="big" />
            </div>
          </div>
        ) : word !== "" ? (
          <div className={styles.AppList}>
            {isRetrieved &&
              !isRetrieving &&
              allApps.map((app) => (
                <div key={app.id} className="AppCardItem">
                  <AppsCard
                    name={app.name}
                    appStatus={app.app_running_status}
                    url={app.url}
                    appId={app.id}
                    otherData={params}
                    disabled={app.disabled}
                    hasDeleted={this.renderAfterDelete}
                    isAi={app.is_ai}
                    isNotebook={app.is_notebook}
                  />
                </div>
              ))}
          </div>
        ) : (
          <div className={styles.AppList}>
            {apps.apps.length !== 0 &&
              !isRetrieving &&
              isRetrieved &&
              sortedApps.map((app) => (
                <div key={app.id} className="AppCardItem">
                  <AppsCard
                    name={app.name}
                    appStatus={app.app_running_status}
                    url={app.url}
                    appId={app.id}
                    otherData={params}
                    disabled={app.disabled}
                    hasDeleted={this.renderAfterDelete}
                    isAi={app.is_ai}
                    isNotebook={app.is_notebook}
                  />
                </div>
              ))}
          </div>
        )}
        {isRetrieved && sortedApps?.length === 0 && (
          <div className={styles.NoAppsError}>
            {word ? (
              <div className={styles.NoAppsResourcesMessage}>
                No results for "{word}"
              </div>
            ) : (
              <>
                {message ? (
                  message
                ) : (
                  <div className={styles.NoAppsResourcesMessage}>
                    You haven’t created any apps yet. Click the &nbsp;{" "}
                    <ButtonPlus
                      className={styles.ButtonPlusSmall}
                      onClick={openComponent}
                    />{" "}
                    &nbsp; button to deploy an app.
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {!isRetrieving && !isRetrieved && (
          <div className={styles.NoAppsResourcesMessage}>
            Oops! Something went wrong! Failed to retrieve Apps.
          </div>
        )}
        {apps?.pagination?.pages > 1 && isRetrieved && !isRetrieving && (
          <div className={styles.PaginationSection}>
            <Pagination
              total={apps.pagination.pages}
              current={this.state.currentPaginationPage}
              onPageChange={this.onPageChange}
            />
          </div>
        )}
      </div>
    );
  }
}

// inititate props
AppsList.propTypes = {
  apps: PropTypes.shape({
    apps: PropTypes.arrayOf(PropTypes.object),
    pagination: PropTypes.object,
  }),
  isRetrieved: PropTypes.bool,
  isRetrieving: PropTypes.bool,
  getAppsList: PropTypes.func,
  message: PropTypes.string,
  params: PropTypes.shape({
    projectID: PropTypes.string.isRequired,
  }).isRequired,
};

// assigning defaults
AppsList.defaultProps = {
  apps: { apps: [], pagination: {} },
  isRetrieved: false,
  isRetrieving: true,
  message: "",
};

export const mapStateToProps = (state) => {
  const { isRetrieving, apps, isRetrieved } = state.appsListReducer;
  return { isRetrieving, apps, isRetrieved };
};

const mapDispatchToProps = {
  getAppsList,
};

 export default connect(mapStateToProps, mapDispatchToProps)(AppsList);
