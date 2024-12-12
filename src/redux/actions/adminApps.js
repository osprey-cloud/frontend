import axios from "../../axios";
import {
  ADMIN_GETTING_ALL_APPS,
  ADMIN_ALL_APPS_FAIL,
  ADMIN_ALL_APPS_SUCCESS,
} from "./actionTypes";

import LRU from "lru-cache";
const cache = new LRU({
  max: 50,
  ttl: 60 * 60 * 1000,
});

let currentCacheKey = null;

export const startGettingApps = () => ({
  type: ADMIN_GETTING_ALL_APPS,
});

export const getAppsSuccess = (response) => ({
  type: ADMIN_ALL_APPS_SUCCESS,
  payload: response.data.data,
});

export const getAppsFail = (error) => ({
  type: ADMIN_ALL_APPS_FAIL,
  payload: {
    status: false,
    error: error.status,
  },
});

const getAppsList = (page, keywords) => async (dispatch) => {
  dispatch(startGettingApps());
  // try {
  //   const response = await axios.get(`/apps?page=${page}`);
  //   return dispatch(getAppsSuccess(response));
  // } catch (error) {
  //   dispatch(getAppsFail(error));
  // }

  const cacheKey = `${page}_${keywords}`;
  currentCacheKey = cacheKey;

  // Check if the data is already cached
  const cachedResponse = cache.get(cacheKey);
  if (cachedResponse) {
    dispatch(getAppsSuccess(cachedResponse));
    return Promise.resolve();
  }

  let link;
  if (keywords) {
    link = `/search?keywords=${keywords}`;
  } else {
    link = `/apps?page=${page}`;
  }

  // Run the API call in the background to fetch updated data
  const backgroundRequest = axios.get(link).then((response) => {
    cache.set(cacheKey, response); // Update the cache with new data
    //prevents background search from affecting the new search
    if (cacheKey === currentCacheKey) {
      dispatch(getAppsSuccess(response));
    }
  });

  // Check if there's an existing cache, but don't wait for the background request to finish
  if (cachedResponse) {
    return Promise.resolve();
  }

  // Return the background request as a promise
  return backgroundRequest.catch((error) => {
    dispatch(getAppsFail(error));
  });
};

export default getAppsList;
