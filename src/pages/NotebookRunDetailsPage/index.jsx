import React from "react";
import styles from "./NotebookRunDetailsPage.module.css";
import PrimaryButton from "../../components/PrimaryButton";
import {
  useExperimentDetails,
  useExperimentRunDetails,
} from "../../hooks/useNotebookExperiments";
import { calculateDuration } from "../../helpers/durationUtility";
import { dateInWords } from "../../helpers/dateConstants";
import Spinner from "../../components/Spinner";

const NotebookRunDetailsPage = ({ runId, handleBackToTable }) => {
  const {
    data: experimentRunDetails,
    isLoading: isLoadingRunDetails,
    error: runsDetailsError,
  } = useExperimentRunDetails(runId);

  const {
    data: experimentDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useExperimentDetails(experimentRunDetails?.info?.experiment_id);

  if (isLoadingRunDetails || isLoadingDetails) {
    return (
      <div className={styles.NoResourcesMessage}>
        <div className={styles.SpinnerWrapper}>
          <div className={styles.noDataSection}>
            <Spinner size="big" />
          </div>
        </div>
      </div>
    );
  }
  if (runsDetailsError || detailsError) {
    return (
      <div className={styles.NoResourcesMessage}>
        <div className={styles.SpinnerWrapper}>
          Error loading experiment run details!
        </div>
      </div>
    );
  }

  const { metrics, params, tags } = experimentRunDetails?.data || {};

  return (
    <div className={styles.pageContainer}>
      <header className={styles.Header}>
        <div className={styles.BackButtonSection}>
          <span
            className={styles.BackClickItem}
            onClick={() => handleBackToTable()}
          >
            {experimentDetails?.name}
          </span>
          <span>&gt; </span>{" "}
          <span className={styles.Title}>
            {" "}
            {experimentRunDetails?.info?.run_name}
          </span>
        </div>
        <PrimaryButton color="primary">Rename</PrimaryButton>
      </header>
      <div
        className={
          styles.SummaryCardContainer + " " + styles.SummaryCardDimentions
        }
      >
        <div className={styles.CardHeaderSection}>
          <div className={styles.CardTitle}>Experiment Summary</div>
        </div>
        <div className={styles.CardBodySection}>
          <div className={styles.InnerCard}>
            <div className={styles.InnerCardSections}>
              <div className={styles.InnerContentGrid}>
                <div className={styles.InnerTitlesStart}>Run ID</div>
                <div className={styles.InnerContentName}> {runId}</div>
              </div>
              <div className={styles.InnerContentGrid}>
                <div className={styles.InnerTitlesStart}>Date Created</div>
                <div className={styles.InnerContentName}>
                  {" "}
                  {dateInWords(experimentRunDetails?.info?.start_time)}
                </div>
              </div>
            </div>
            <hr />
            <div className={styles.InnerCardSections}>
              <div className={styles.InnerContentGrid}>
                <div className={styles.InnerTitlesMiddle}>
                  Experiment Status
                </div>
                <div className={styles.InnerContentStatus}>
                  {experimentRunDetails?.info?.status === "FINISHED" ? (
                    <span className="current-label">
                      {experimentRunDetails?.info?.status}
                    </span>
                  ) : (
                    <span className="error-label">
                      {experimentRunDetails?.info?.status}
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.InnerContentGrid}>
                <div className={styles.InnerTitlesMiddle}>Duration</div>
                <div className={styles.InnerContentAge}>
                  {calculateDuration(
                    experimentRunDetails?.info?.start_time,
                    experimentRunDetails?.info?.end_time
                  )}
                </div>
              </div>
            </div>
            <hr />
            <div className={styles.InnerCardSections}>
              <div className={styles.InnerContentGrid}>
                <div className={styles.InnerTitlesEnd}>Artifacts URI</div>
                <div className={styles.InnerContentEnd}>
                  <code> {experimentRunDetails?.info?.artifact_uri}</code>
                </div>
              </div>
              <div className={styles.InnerContentGrid}>
                <div className={styles.InnerTitlesEnd}>Lifecycle Stage</div>
                <div className={styles.InnerContentEnd}>
                  {" "}
                  {experimentRunDetails?.info?.lifecycle_stage}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.Sections}>
        <div className={styles.section}>
          <div className={styles.DescriptionArea}>
            <h2>Description</h2>
            <small className={styles.editLink}>Edit</small>
          </div>
          <div> Add a description </div>
        </div>

        <div className={styles.section}>
          <h2>Parameters</h2>
          <>
            {Object.keys(params).length > 0 ? (
              <div className="InnerTableSection">
                <div className="ResourcesTable">
                  <table className="UsersTable">
                    <thead className="uppercase">
                      <tr>
                        <th>Name</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(params).map(([key, value]) => (
                        <tr key={key}>
                          <td>{key}</td>
                          <td>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.noDataSection}>
                  <p>No parameters have been logged yet!</p>
                </div>
              </>
            )}
          </>
        </div>

        <div className={styles.section}>
          <h2> Metrics </h2>
          <>
            {Object.keys(metrics).length > 0 ? (
              <div className="InnerTableSection">
                <div className="ResourcesTable">
                  <table className="UsersTable">
                    <thead className="uppercase">
                      <tr>
                        <th>Name</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(metrics).map(([key, value]) => (
                        <tr key={key}>
                          <td>{key}</td>
                          <td>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.noDataSection}>
                  <p>No metrics have been logged yet!</p>
                </div>
              </>
            )}
          </>
        </div>

        <div className={styles.section}>
          <h2> Tags </h2>
          <>
            {Object.keys(tags).length > 0 ? (
              <div className="InnerTableSection">
                <div className="ResourcesTable">
                  <table className="UsersTable">
                    <thead className="uppercase">
                      <tr>
                        <th>Name</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(tags).map(([key, value]) => (
                        <tr key={key}>
                          <td>{key}</td>
                          <td>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.noDataSection}>
                  <p>No tags have been added yet!</p>
                </div>
              </>
            )}
          </>
        </div>

        <div className={styles.section}>
          <h2> Artifacts </h2>
          <>
            <div className={styles.noDataSection}>
              <p>No Artifacts recorded</p>
            </div>
          </>
        </div>
      </div>
    </div>
  );
};

export default NotebookRunDetailsPage;
