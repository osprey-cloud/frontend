import { databaseAxios } from "../../axios";
import {
  FETCH_PROJECT_DATABASES_SUCCESS,
  FETCH_PROJECT_DATABASES_FAILED,
  IS_FETCHING_PROJECT_DATABASES,
  CLEAR_PROJECT_DATABASES,
} from "./actionTypes";

const startFetchingDatabases = () => ({
  type: IS_FETCHING_PROJECT_DATABASES,
});

const getDatabasesSuccess = (response) => ({
  type: FETCH_PROJECT_DATABASES_SUCCESS,
  payload: response.data.data.databases,
});

const getDatabasesFailed = (error) => ({
  type: FETCH_PROJECT_DATABASES_FAILED,
  payload: {
    status: false,
    error: error.status,
  },
});

const clearProjectDatabases = () => ({
  type: CLEAR_PROJECT_DATABASES,
});

const getProjectDatabases = (projectID) => (dispatch) => {
  dispatch(startFetchingDatabases());

  return databaseAxios
    .get(`/databases?project_id=${projectID}`)
    .then((response) => {
      dispatch(getDatabasesSuccess(response));
    })
    .catch((error) => {
      dispatch(getDatabasesFailed(error));
    });
};

export default getProjectDatabases;
export { clearProjectDatabases };
