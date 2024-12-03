/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { handleGetRequest } from "../../apis/apis";
import Header from "../Header";
import InformationBar from "../InformationBar";
import Avatar from "../Avatar";
import moment from "moment";
import PrimaryButton from "../PrimaryButton";
import { handlePostRequestWithOutDataObject } from "../../apis/apis.js";
import userProfleStyles from "../UserProfile/UserProfile.module.css";
import { ReactComponent as CopyText } from "../../assets/images/copy.svg";
import { ReactComponent as Checked } from "../../assets/images/checked.svg";
import "./DockerWebHook.css";
import Spinner from "../Spinner";
import SettingsActionRow from "../SettingsActionRow";

const DockerWebHook = () => {
  const [imageTag, setImageTag] = useState("");
  const [url, setUrl] = useState("");
  const [showUrl, setShowUrl] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const history = useHistory();

  const goBack = () => {
    history.goBack();
  };

  const isStaging = /localhost|staging/.test(window.location.href);

  const user = useSelector((state) => state.user);
  const { appID } = useParams();
  let { data } = user;

  const defaultUrl = isStaging
    ? `https://staging-api.cranecloud.io/apps/${appID}/${data.id}/docker`
    : `https://api.cranecloud.io/apps/${appID}/${data.id}/docker`;

  const handleInputChange = (e) => {
    setImageTag(e.target.value);
    setShowUrl(false);
  };

  const updateUrl = () => {
    const tagToUse = imageTag || "latest"; // Use the input value or "latest" if no value is provided
    setUrl(`${defaultUrl}/${tagToUse}/webhook`);
    setShowUrl(true);
  };
  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(url);
    setIsCopied(true);
  };

  return (
    <div className="MainPage">
      <div className="TopBarSection">
        <Header />
      </div>
      <div className="SectionContainer">
        <div className="Mainsection">
          <div className="MainContentSection">
            <div className="InformationBarSection">
              <InformationBar
                header={<span onClick={goBack}>App Settings</span>}
                showBtn={false}
                showBackBtn={true}
              />
            </div>
            <div className="ShortContainer">
              <div className="ContentSection">
                <div className="AdminUserPageContainer">
                  <div className="AdminDBSections">
                    <div className="SectionTitle">
                      Set up Continous Integration
                    </div>
                    <div className="ProjectInstructions BigCard">
                      <div className="MemberBody">
                        <div className="MemberTableRow">
                          <div className="SettingsSectionRow">
                            <div className="SubTitle">
                              Specify Image Tag
                              <br />
                              <div className="SubTitleContent">
                                Specify Image Tag for your image and if none is
                                provided <strong>"Latest"</strong> will be
                                chosen as the default tag.
                              </div>
                            </div>
                          </div>
                        </div>
                        <br />
                        <div className="MemberTableRow">
                          <div className="PortSection">
                            <div>Add Tag:</div>
                            <div className="commandInputSection">
                              <div>
                                <input
                                  type="text"
                                  value={imageTag}
                                  onChange={handleInputChange}
                                  placeholder="Enter a value"
                                  className="imageTag"
                                />
                              </div>
                            </div>
                          </div>
                          <br />
                          <br />
                        </div>
                        <div>
                          <SettingsActionRow
                            title="Generate Link"
                            content="To Generate a link with a token click the Generate
                        link button."
                            buttonLabel="Generate Link"
                            onButtonClick={updateUrl}
                          />
                          <div className="DBInfoBottom">
                            {showUrl && (
                              <div>
                                <p>
                                  <strong>Image Tag:</strong>{" "}
                                  {imageTag || "latest"}
                                </p>
                                <p>
                                  <strong> URL:</strong>
                                  <code className="DockerInfo"> {url}</code>
                                </p>
                                <p>
                                  <strong> Copy URL:</strong> &nbsp;
                                  <CopyText onClick={copyUrlToClipboard} />
                                  &nbsp;
                                  {isCopied ? <Checked /> : null}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <br />
                      </div>
                    </div>
                  </div>
                  <div className="APPSections">
                    <div className="SectionTitle">Add link to Dockerhub</div>
                    <div className="ProjectInstructions BigCard">
                      <div className="">
                        1. To add the webhook, copy the generated link above and
                        head to dockerhub.com under the repository of your
                        docker image.
                      </div>
                      <div>
                        2. On the image repository click the{" "}
                        <strong>Webhooks</strong> tab.
                      </div>
                      <div>
                        3. Under new Webhook give your webhook any name of your
                        choice and add the genereated URL token from Crane Cloud
                        and click create.
                      </div>
                      <div>
                        4. Continous Integration has been successfully been
                        added for your application.
                      </div>
                    </div>
                  </div>
                </div>

                <br />
                <br />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DockerWebHook;
