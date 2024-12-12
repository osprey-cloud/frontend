import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { handleGetRequest } from "../../apis/apis.js";
import InformationBar from "../../components/InformationBar";
import PrimaryButton from "../../components/PrimaryButton";
import { DisplayDateTime } from "../../helpers/dateConstants";
import Header from "../../components/Header";
import styles from "./AdminAppDetail.module.css";
import { handlePostRequestWithOutDataObject } from "../../apis/apis.js";
import { useDispatch, useSelector } from "react-redux";
import getAppRevisions, {
  clearFetchAppRevisionsState,
} from "../../redux/actions/getRevisions.js";
import Spinner from "../../components/Spinner/index.js";
import { useProject } from "../../hooks/useProject.js";

const AdminAppDetail = () => {
  const dispatch = useDispatch();
  const { appID } = useParams();
  const [projectID, setProjectID] = useState("");
  const [appDetail, setAppDetail] = useState({});

  const { revisions, isFetching } = useSelector(
    (state) => state.appRevisionsReducer
  );

  const { data: projectDetails, isLoading } = useProject(projectID);

  useEffect(() => {
    getAppDetails(appID);
  }, [appID]);

  const applicationRevisions = useCallback(
    () => dispatch(getAppRevisions(appID)),
    [dispatch, appID]
  );

  useEffect(() => {
    applicationRevisions();
    return () => {
      dispatch(clearFetchAppRevisionsState());
    };
  }, [applicationRevisions, dispatch]);

  useEffect(() => {
    dispatch(getAppRevisions(appID));
    return () => {
      dispatch(clearFetchAppRevisionsState());
    };
  }, [appID, dispatch]);

  const getAppDetails = async (appID) => {
    try {
      const response = await handleGetRequest(`/apps/${appID}`);
      if (response.data.status === "success") {
        setAppDetail(response.data.data);
        setProjectID(response.data.data?.apps?.project_id);
      } else {
        throw new Error("No App detail found");
      }
    } catch (error) {
      throw new Error("Failed to fetch app detail, please try again");
    }
  };

  const handleEnableButtonClick = () => {
    try {
      if (appDetail?.apps?.disabled) {
        handlePostRequestWithOutDataObject(appID, `/apps/${appID}/enable`)
          .then(() => {
            window.location.reload();
          })
          .catch((error) => {
            console.error("API call error:", error);
            // setError(error);
            window.location.reload();
          });
      } else {
        handlePostRequestWithOutDataObject(appID, `/apps/${appID}/disable`)
          .then(() => {
            window.location.reload();
          })
          .catch((error) => {
            console.error("API call error:", error);
            // setError(error);
            window.location.reload();
          });
      }
    } catch (error) {
      console.error("API call error:", error);
    }
  };

  return (
    <div className={styles.Page}>
      <div className="TopRow">
        <Header />
        <InformationBar header="App Detail" showBackBtn />
      </div>

      <div className="TitleContainer">
        <div className="TitleArea">
          <div className="SectionTitle" style={{ paddingTop: "1rem" }}>
            <b>Application Detail</b>{" "}
            <PrimaryButton
              onClick={handleEnableButtonClick}
              color={
                appDetail?.apps?.disabled ? "primary-outline" : "red-outline"
              }
            >
              {appDetail?.apps?.disabled ? "Enable" : "Disable"}
            </PrimaryButton>
          </div>
        </div>
      </div>

      <div className={styles.DetailContainer}>
        <div className={styles.DetailFirst}>
          <div className={styles.DetailFirstTitle}>App Information</div>
          <div className={styles.DetailFirstDetail}>
            {isFetching ? (
              <div className={styles.SpinnerArea}>
                <Spinner size={"big"} />
              </div>
            ) : (
              <>
                <div class="list-group">
                  <div className={styles.listItem}>
                    <strong>Name:</strong> {appDetail?.apps?.name}
                  </div>
                  <div className={styles.listItem}>
                    <strong>ID:</strong> {appDetail?.apps?.id}
                  </div>
                  <div className={styles.listItem}>
                    <strong>URL:</strong>{" "}
                    <a
                      href={appDetail?.apps?.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {appDetail?.apps?.url}
                    </a>
                  </div>
                  <div className={styles.listItem}>
                    <strong>Port:</strong> {appDetail?.apps?.port}
                  </div>
                  <div className={styles.listItem}>
                    <strong>Custom Domain:</strong>{" "}
                    {appDetail?.apps?.has_custom_domain === "true"
                      ? "Yes"
                      : "No"}
                  </div>
                  <div className={styles.listItem}>
                    <strong>Date Created:</strong>{" "}
                    {DisplayDateTime(new Date(appDetail?.apps?.date_created))}
                  </div>
                  <div className={styles.listItem}>
                    <strong>Command:</strong>{" "}
                    {appDetail?.apps?.command
                      ? appDetail?.apps?.command
                      : "None"}
                  </div>
                  <div className={styles.listItem}>
                    <strong>Private Image:</strong>{" "}
                    {appDetail?.apps?.private_image === "true" ? "Yes" : "No"}
                  </div>
                  <div className={styles.listItem}>
                    <strong>Age:</strong> {appDetail?.apps?.age}
                  </div>
                  <div className={styles.listItem}>
                    <strong>Alias:</strong> {appDetail?.apps?.alias}
                  </div>
                  <div className={styles.listItem}>
                    <strong>Image:</strong> {appDetail?.apps?.image}
                  </div>
                  <div className={styles.listItem}>
                    <strong>Replicas:</strong> {appDetail?.apps?.replicas}
                  </div>
                  <div className={styles.listItem}>
                    <strong>Running Status:</strong>{" "}
                    {appDetail?.apps?.app_running_status}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className={styles.DetailSecondColumn}>
          <div>
            <div className={styles.DetailFirstTitle}>Cluster Information</div>
            {isLoading ? (
              <div className={styles.SpinnerArea}>
                <Spinner size={"small"} />
              </div>
            ) : (
              <>
                <div class="list-group">
                  <div className={styles.listItem}>
                    <strong>Name:</strong>{" "}
                    {projectDetails
                      ? projectDetails?.data?.data?.project?.cluster?.name
                      : "N/A"}
                  </div>
                  <div className={styles.listItem}>
                    <strong>ID:</strong>{" "}
                    {projectDetails
                      ? projectDetails?.data?.data?.project?.cluster?.id
                      : "N/A"}
                  </div>
                  <div className={styles.listItem}>
                    <strong>Description:</strong>{" "}
                    {projectDetails
                      ? projectDetails?.data?.data?.project?.cluster
                          ?.description
                      : "N/A"}
                  </div>
                  <div className={styles.listItem}>
                    <strong>Created:</strong>{" "}
                    {projectDetails
                      ? DisplayDateTime(
                          new Date(
                            projectDetails?.data?.data?.project?.cluster?.date_created
                          )
                        )
                      : "N/A"}
                  </div>
                </div>
              </>
            )}
          </div>

          <div>
            <div className={styles.DetailFirstTitle}>Project Information</div>
            {isLoading ? (
              <div className={styles.SpinnerArea}>
                <Spinner size={"small"} />
              </div>
            ) : (
              <>
                <div class="list-group">
                  <div className={styles.listItem}>
                    <strong>Name:</strong>{" "}
                    {projectDetails
                      ? projectDetails?.data?.data?.project?.name
                      : "N/A"}
                  </div>
                  <div className={styles.listItem}>
                    <strong>Description:</strong>{" "}
                    {projectDetails
                      ? projectDetails?.data?.data?.project?.description
                      : "N/A"}
                  </div>
                  <div className={styles.listItem}>
                    <strong>Owner ID:</strong>{" "}
                    {projectDetails
                      ? projectDetails?.data?.data?.project?.owner_id
                      : "N/A"}
                  </div>
                  <div className={styles.listItem}>
                    <strong>Created:</strong>{" "}
                    {projectDetails
                      ? DisplayDateTime(
                          new Date(
                            projectDetails?.data?.data?.project?.date_created
                          )
                        )
                      : "N/A"}
                  </div>
                </div>
              </>
            )}
          </div>

          <div>
            <div className={styles.DetailFirstTitle}>Current Revision</div>
            {isFetching ? (
              <div className={styles.SpinnerArea}>
                <Spinner size={"small"} />
              </div>
            ) : (
              <>
                <div class="list-group">
                  <div className={styles.listItem}>
                    <strong>Revision No:</strong>{" "}
                    {revisions?.length > 0 ? revisions[0].revision : "N/A"}
                  </div>
                  <div className={styles.listItem}>
                    <strong>Revision ID:</strong>{" "}
                    {revisions?.length > 0 ? revisions[0].revision_id : "N/A"}
                  </div>
                  <div className={styles.listItem}>
                    <strong>Created:</strong>{" "}
                    {revisions?.length > 0
                      ? DisplayDateTime(new Date(revisions[0].created_at))
                      : "N/A"}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="FooterRow">
        <p>
          Copyright {new Date().getFullYear()} Crane Cloud. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default AdminAppDetail;
