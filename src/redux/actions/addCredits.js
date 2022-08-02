import axios from "../../axios";
import {
  ADDING_USER_CREDITS,
  ADD_BETA_USER_CREDITS_SUCCESS,
  ADD_BETA_USER_CREDITS_FAIL,
} from "./actionTypes";

const startAddingUserCredits = () => ({
  type: ADDING_USER_CREDITS,
});

const addUserCreditsSuccess = (response) => ({
  type: ADD_BETA_USER_CREDITS_SUCCESS,
  payload: response.data,
});

const addUserCreditsFail = (error) => ({
  type: ADD_BETA_USER_CREDITS_FAIL,
  payload: {
    error: error.response,
  },
});

const addUserCredits = (creditsData) => (dispatch) => {
  dispatch(startAddingUserCredits());

  return axios
    .post(`/credit_assignment`, creditsData)
    .then((response) => dispatch(addUserCreditsSuccess(response)))
    .catch((error) => {
      dispatch(addUserCreditsFail(error));
    });
};

export default addUserCredits;
