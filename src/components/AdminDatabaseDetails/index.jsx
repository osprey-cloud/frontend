/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { handleGetRequest } from "../../apis/apis";
import Header from "../Header";
import InformationBar from "../InformationBar";
import Avatar from "../Avatar";
import moment from "moment";
import PrimaryButton from "../PrimaryButton";
import userProfleStyles from "../UserProfile/UserProfile.module.css";
import "./AdminDatabaseDetails.css";
import Spinner from "../Spinner";
import AppFooter from "../appFooter";
import SettingsActionRow from "../SettingsActionRow";

const AdminDatabaseDetails = () => {
  const { databaseID } = useParams();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState("");

  const fetchDatabaseDetails = useCallback(() => {
    setLoading(true);
    handleGetRequest(`/databases/${databaseID}`)
      .then((response) => {
        setDetails(response.data.data.database);
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to fetch database detail please refresh");
        setLoading(false);
      });
  }, [databaseID]);

  const fetchProjectSummary = useCallback(() => {
    setLoading(true);
    handleGetRequest(`/projects/${details?.project_id}`)
      .then((response) => {
        setProjectName(response.data.data.project.name);
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to fetch project detail please refresh");
        setLoading(false);
      });
  }, [details?.project_id]);

  useEffect(() => {
    fetchProjectSummary();
    fetchDatabaseDetails();
  }, [fetchDatabaseDetails, fetchProjectSummary]);

  return (
    <div className="MainPage">
      <div className="TopBarSection">
        <Header />
      </div>
      <div className="Mainsection">
        <div className="MainContentSection">
          <div className="InformationBarSection">
            <InformationBar
              header={
                <span>
                  <Link className="breadcrumb" to={`/databases`}>
                    Databases
                  </Link>
                  / {details?.name}
                </span>
              }
              showBtn={false}
              showBackBtn={true}
            />
          </div>

          <div className="LeftAlignContainer">
            {projectName === "" ? (
              <div className="ResourceSpinnerWrapper">
                <Spinner size="big" />
              </div>
            ) : (
              <>
                <div className="ContentSection">
                  <div className="AdminUserPageContainer">
                    <section>
                      <div className="SectionTitle">Database information</div>
                      <div className="AdminCardArea">
                        <div className="AdminUserProfileCard">
                          <>
                            <div className="AdminUserProfileInfoSect">
                              <div className="AdminUserProfileInfoHeader">
                                <Avatar
                                  name={details?.name}
                                  className={userProfleStyles.UserAvatarLarge}
                                />
                                <div className={userProfleStyles.Identity}>
                                  <div
                                    className={userProfleStyles.IdentityName}
                                  >
                                    <div className="AdminProfileName">
                                      {details?.name}
                                    </div>
                                    {details?.db_status === true && (
                                      <div
                                        className={userProfleStyles.BetaUserDiv}
                                      >
                                        Active
                                      </div>
                                    )}
                                  </div>
                                  <div
                                    className={userProfleStyles.IdentityEmail}
                                  >
                                    Database Type:{" "}
                                    {details?.database_flavour_name}
                                  </div>
                                </div>
                              </div>

                              <div className="AdminProfileRowInfo">
                                <div className="AdminProfileRowItem">
                                  Parent Project:
                                  <span className="AdminProfileRowValue">
                                    {projectName}
                                  </span>
                                </div>
                                |
                                <div className="AdminProfileRowItem">
                                  Host:
                                  <span>{details?.host}</span>
                                </div>
                                |
                                <div className="AdminProfileRowItem">
                                  Port:
                                  <span>{details?.port}</span>
                                </div>
                                |
                                <div className="AdminProfileRowItem">
                                  Date Created:
                                  <span>
                                    {moment(details?.date_created)
                                      .utc()
                                      .format("ddd, MMMM DD, yyyy")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </>
                        </div>
                      </div>
                    </section>

                    <div className="AdminDBSections">
                      <div className="SectionTitle">Manage Database</div>
                      <div className="ProjectInstructions BigCard">
                        <div className="MemberBody">
                          <SettingsActionRow
                            title="Disable Database"
                            content="This will temporarily disable the database."
                            buttonLabel="Disable"
                            buttonColor="red"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <AppFooter />
        </div>
      </div>
    </div>
  );
};

export default AdminDatabaseDetails;
