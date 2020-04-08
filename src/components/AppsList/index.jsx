
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import getAppsList from '../../redux/actions/appsListActions';
import AppsCard from '../AppsCard';
import { BigSpinner } from '../SpinnerComponent';
import './AppsList.css';


class AppsList extends Component {
  constructor(props) {
    super(props);
    const { newAppCreated } = this.props;
    this.state = {
      newAppCreated: newAppCreated
    };
  }

  componentDidMount() {
    const { params, getAppsList } = this.props;
    getAppsList(params.projectID);
  }

  componentDidUpdate(prevProps, prevState) {
    const { params, getAppsList } = this.props;
    debugger;
    if (prevState.newAppCreated !== this.state.newAppCreated) {
      debugger;
      getAppsList(params.projectID);
    }
  }

  // static getDerivedStateFromProps(nextProps, prevState) {

  // }

  render() {
    const { apps, isRetrieved, isRetrieving } = this.props;
    return (
      <div className="AppsList">
        {
          isRetrieving ? (
            <div className="TableLoading">
              <div className="SpinnerWrapper">
                <BigSpinner />
              </div>
            </div>
          ) : (
            <div className="AppList">
              {isRetrieved && apps.apps !== undefined && (
                apps.apps.map((app) => (
                  <div key={app.id} className="AppCardItem">
                    <AppsCard
                      name={app.name}
                      status
                      url={app.url}
                      appId={app.id}
                    />
                  </div>
                )))}
            </div>
          )

        }
        {(isRetrieved && apps.apps.length === 0) && (
          <div className="NoContentDiv">
            You haven’t created any Apps yet.
            Click the create button to get started.
          </div>
        )}
        {(!isRetrieving && !isRetrieved) && (
          <div className="NoContentDiv">
            Oops! Something went wrong!
            Failed to retrieve Apps.
          </div>
        )}

      </div>
    );
  }
}

// inititate props
AppsList.propTypes = {
  apps: PropTypes.arrayOf(PropTypes.object),
  isRetrieved: PropTypes.bool,
  isRetrieving: PropTypes.bool
};

// assigning defaults
AppsList.defaultProps = {
  apps: [],
  isRetrieved: false,
  isRetrieving: true
};

export const mapStateToProps = (state) => {
  const { isRetrieving, apps, isRetrieved } = state.AppsListReducer;
  return { isRetrieving, apps, isRetrieved };
};

export const mapDispatchToProps = (dispatch) => bindActionCreators({
  getAppsList
}, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppsList);
