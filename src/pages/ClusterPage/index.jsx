import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import InformationBar from "../../components/InformationBar";
import PrimaryButton from "../../components/PrimaryButton";
import Spinner from "../../components/Spinner";
import BlackInputText from "../../components/BlackInputText";
import Modal from "../../components/Modal";
import ClustersList from "../../components/ClustersList";
import Header from "../../components/Header";
import addCluster, {
  clearAddClusterState,
} from "../../redux/actions/addCluster";
import Feedback from "../../components/Feedback";
import styles from "./ClusterPage.module.css";
import getClustersList from "../../redux/actions/clusters";
import { handleGetRequest } from "../../apis/apis.js";
import { useAdminDatabaseStats } from "../../hooks/useDatabases.js";

const ClusterPage = ({
  creatingCluster,
  isAdded,
  isFailed,
  addCluster,
  message,
  clearAddClusterState,
  clusters,
}) => {
  const [name, setName] = useState("");
  const [host, setHost] = useState("");
  const [token, setToken] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [error, setError] = useState("");
  const [description, setDescription] = useState("");
  const [prometheus_url, setPrometheus_url] = useState("");
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);

  const { data: databaseStats, isLoading: isLoadingDatabaseStats } =
    useAdminDatabaseStats();

  useEffect(() => {
    getClustersList();
    getAllMetrics();
  }, []);

  const getAllMetrics = async () => {
    setLoading(true);
    try {
      const response = await handleGetRequest("/system_summary");
      if (response.data.status === "success") {
        setSummary(response.data.data);
        setLoading(false);
      }
    } catch (error) {
      setError("Failed to fetch summary metrics, please try again");
    } finally {
      setLoading(false);
    }
  };

  const showForm = () => setOpenModal(true);

  const hideForm = () => {
    clearAddClusterState();
    setOpenModal(false);
  };

  const handleSubmit = () => {
    // input validation
    if (!host || !name || !token || !description || !prometheus_url) {
      setError("Please provide all the information");
    } else {
      const cluster = {
        host,
        name,
        token,
        description,
        prometheus_url,
      };

      addCluster(cluster);
    }
  };
  
  return (
    <div className={styles.Page}>
      <div className="TopRow">
        <Header />
        <InformationBar
          header="Overview"
          showBtn
          buttontext="+ New Cluster"
          btnAction={showForm}
          adminRoute={true}
          adminProjects={true}
        />
      </div>

      <div className="TitleContainer">
        <div className="TitleArea">
          <div className="SectionTitle" style={{ paddingTop: "1rem" }}>
            <b>Summary</b>
          </div>
        </div>
      </div>

      {summary && Object.keys(summary).length > 0 ? (
        <div className={styles.OtherCards}>
          <Link to="/accounts" className={styles.ResourceCard}>
            <div className={styles.columnCardSection}>
              <div className={styles.CardHeader}>Users</div>
              <div className={styles.ResourceDigit}>
                {summary?.Users?.total_count}
              </div>
            </div>
            <div className={styles.rowCardSection}>
              <div className={styles.columnCardSection}>
                <div className={styles.innerCardHeader}>Verified</div>
                <div className={styles.rowResourceDigit}>
                  {summary?.Users?.verified}
                </div>
              </div>
              <div className={styles.columnCardSection}>
                <div className={styles.innerCardHeader}>Unverified</div>
                <div
                  className={`${styles.rowResourceDigit} ${styles.rightTextAlign}`}
                >
                  {parseInt(
                    parseInt(summary?.Users?.total_count) -
                      parseInt(summary?.Users?.verified)
                  )}
                </div>
              </div>
            </div>
          </Link>
          <Link to="/projects-overview" className={styles.ResourceCard}>
            <div className={styles.columnCardSection}>
              <div className={styles.CardHeader}>Projects</div>
              <div className={styles.ResourceDigit}>
                {summary?.Projects?.total_count}
              </div>
            </div>
            <div className={styles.rowCardSection}>
              <div className={styles.columnCardSection}>
                <div className={styles.innerCardHeader}>Active</div>
                <div className={styles.rowResourceDigit}>
                  {summary?.Projects?.total_count - summary?.Projects?.disabled}
                </div>
              </div>
              <div className={styles.columnCardSection}>
                <div className={styles.innerCardHeader}>Disabled</div>
                <div
                  className={`${styles.rowResourceDigit} ${styles.rightTextAlign}`}
                >
                  {summary?.Projects?.disabled}
                </div>
              </div>
            </div>
          </Link>
          <Link to="/databases" className={styles.ResourceCard}>
            <div className={styles.columnCardSection}>
              <div className={styles.CardHeader}>Databases</div>
              <div className={styles.ResourceDigit}>
                {databaseStats?.data?.data?.databases?.total_database_count}
              </div>
            </div>
            <div className={styles.rowCardSection}>
              <div className={styles.columnCardSection}>
                <div className={styles.innerCardHeader}>MySql</div>
                <div className={styles.rowResourceDigit}>
                  {
                    databaseStats?.data?.data?.databases?.dbs_stats_per_flavour
                      ?.mysql_db_count
                  }
                </div>
              </div>
              <div className={styles.columnCardSection}>
                <div className={styles.innerCardHeader}>Postgresql</div>
                <div
                  className={`${styles.rowResourceDigit} ${styles.rightTextAlign}`}
                >
                  {
                    databaseStats?.data?.data?.databases?.dbs_stats_per_flavour
                      ?.postgres_db_count
                  }
                </div>
              </div>
            </div>
          </Link>
          <Link to="/apps" className={styles.ResourceCard}>
            <div className={styles.columnCardSection}>
              <div className={styles.CardHeader}>Apps</div>
              <div className={styles.ResourceDigit}>
                {summary ? summary?.Apps?.total_count : 0}
              </div>
            </div>
            <div className={styles.rowCardSection}>
              <div className={styles.columnCardSection}>
                <div className={styles.innerCardHeader}>Up</div>
                <div className={styles.rowResourceDigit}>
                  {summary?.Apps?.total_count}
                </div>
              </div>
              <div className={styles.columnCardSection}>
                <div className={styles.innerCardHeader}>Down</div>
                <div
                  className={`${styles.rowResourceDigit} ${styles.rightTextAlign}`}
                >
                  {0}
                </div>
              </div>
            </div>
          </Link>
        </div>
      ) : loading || isLoadingDatabaseStats ? (
        <div className={styles.LoadingArea}>
          <Spinner size="big" />
        </div>
      ) : (
        <div className="NoResourcesMessage">{error}</div>
      )}

      <div className="TitleContainer">
        <div className="TitleArea">
          <div className="SectionTitle" style={{ paddingTop: "2rem" }}>
            <b>Select Infrastructure ({clusters?.metadata?.cluster_count})</b>
          </div>
        </div>
      </div>

      <div className="MainRow">
        <ClustersList newClusterAdded={isAdded} />
      </div>

      <div style={{ paddingLeft: "1.8rem" }}>
        <p>
          Copyright {new Date().getFullYear()} Crane Cloud. All Rights Reserved.
        </p>
      </div>

      <Modal showModal={openModal} onClickAway={hideForm}>
        <div className="ModalForm">
          <div className="ModalFormHeading">
            <h2>Add a cluster</h2>
          </div>
          <div className="ModalFormInputs">
            <div className="ModalFormInputsBasic">
              <BlackInputText
                required
                placeholder="Host"
                name="host"
                value={host}
                onChange={(e) => setHost(e.target.value)}
              />
              <BlackInputText
                required
                placeholder="Token"
                name="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <BlackInputText
                required
                placeholder="Name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <BlackInputText
                required
                placeholder="Prometheus Url"
                name="prometheus_url"
                value={prometheus_url}
                onChange={(e) => setPrometheus_url(e.target.value)}
              />
              <BlackInputText
                required
                placeholder="Description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              {error && <Feedback type="error" message={error} />}

              <div className="ModalFormButtons AddAddButtons">
                <PrimaryButton className="CancelBtn" onClick={hideForm}>
                  Cancel
                </PrimaryButton>
                <PrimaryButton onClick={handleSubmit}>
                  {creatingCluster ? <Spinner /> : "add"}
                </PrimaryButton>
              </div>

              {(isFailed || isAdded) && (
                <Feedback
                  type={isAdded ? "success" : "error"}
                  message={message}
                />
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export const mapStateToProps = (state) => {
  const { creatingCluster, isAdded, isFailed, errorOccured, message } =
    state.addClusterReducer;
  const { user } = state.user;
  const { clusters } = state.clustersReducer;

  return {
    user,
    creatingCluster,
    isAdded,
    isFailed,
    errorOccured,
    message,
    clusters,
  };
};

const mapDispatchToProps = {
  addCluster,
  clearAddClusterState,
  getClustersList,
};

export default connect(mapStateToProps, mapDispatchToProps)(ClusterPage);
