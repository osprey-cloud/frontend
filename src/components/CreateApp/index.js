import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import PrimaryButton from "../PrimaryButton";
import Select from "../Select";
//import CancelButton from "../CancelButton";
import BlackInputText from "../BlackInputText";
import { v4 as uuidv4 } from "uuid";
// import Modal from "../Modal";
import RemoveIcon from "../../assets/images/remove.svg";
//import ToggleOnOffButton from "../ToggleOnOffButton";
import { handlePostRequestWithOutDataObject } from "../../apis/apis.js";
import Spinner from "../Spinner";
import Feedback from "../Feedback";
import Checkbox from "../Checkbox";
import Tooltip from "../Tooltip";
import Tabs from "../Tabs";
import styles from "./CreateApp.module.css";
import { validateName } from "../../helpers/validation";
import MiraPage from "../../pages/MiraPage";
import { ReactComponent as Open } from "../../assets/images/open.svg";
import { ReactComponent as Closed } from "../../assets/images/close.svg";
import AttentionComponent from "../attentionComponent";
import { parseEnvContent } from "../../helpers/fileParser";

// const dockerEmail = process.env.REACT_APP_DOCKER_EMAIL;
// const dockerPassword = process.env.REACT_APP_DOCKER_PASSWORD;
const replicaOptions = [
  { id: 1, name: "1" },
  { id: 2, name: "2" },
  { id: 3, name: "3" },
];
class CreateApp extends React.Component {
  constructor(props) {
    super(props);

    const {
      clusters: { clusters },
    } = this.props;
    this.state = {
      name: "",
      uri: "",
      varName: "",
      varValue: "",
      envVars: {},
      error: "",
      createFeedback: "",
      entryCommand: "",
      port: "",
      isPrivateImage: false,
      isCustomDomain: false,
      currentDeploymentMethod: "default",
      domainName: "",
      dockerCredentials: {
        username: "",
        email: "",
        password: "",
        server: "",
        error: "",
        passwordShown: false,
      },
      replicas: 1,
      multiCluster: false,
      SelectedClusters: new Array(clusters?.length).fill(false),
      addingApp: false,
      addErrorCode: "",
      fileEnvContent: "",
      formInstances: [
        {
          id: 1,
          isOpen: true,
          formData: {
            name: "",
            uri: "",
            varName: "",
            varValue: "",
            envVars: {},
            otherAppEnvVars: {},
            varNameOtherApps: "",
            varValueOtherApps: "",
            error: "",
            createFeedback: "",
            entryCommand: "",
            port: "",
            isPrivateImage: false,
            isCustomDomain: false,
            currentDeploymentMethod: "default",
            domainName: "",
            selectedInstance: "",
            envFileContent: "",
            replicas: 1,
          },
        },
      ],
      instanceNameValues: {},
    };

    this.myRef = React.createRef();

    this.addEnvVar = this.addEnvVar.bind(this);
    this.handleVarValueOtherAppsChange =
      this.handleVarValueOtherAppsChange.bind(this);
    this.addMicroserviceEnvVar = this.addMicroserviceEnvVar.bind(this);
    this.removeMicroserviceEnvVar = this.removeMicroserviceEnvVar.bind(this);
    this.addEnvVarFromOtherApps = this.addEnvVarFromOtherApps.bind(this);
    this.removeEnvVarFromOtherApps = this.removeEnvVarFromOtherApps.bind(this);
    this.removeEnvVar = this.removeEnvVar.bind(this);
    this.showForm = this.showForm.bind(this);
    this.hideForm = this.hideForm.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateDomainName = this.validateDomainName.bind(this);
    this.togglePrivateImage = this.togglePrivateImage.bind(this);
    this.toggleCustomDomain = this.toggleCustomDomain.bind(this);
    this.toggleDefaultDeployment = this.toggleDefaultDeployment.bind(this);
    this.toggleMiraDeployment = this.toggleMiraDeployment.bind(this);
    this.toggleMicroservice = this.toggleMicroservice.bind(this);
    this.handleDockerCredentialsChange =
      this.handleDockerCredentialsChange.bind(this);
    this.handleSelectReplicas = this.handleSelectReplicas.bind(this);
    this.changeMultiSelectionOption =
      this.changeMultiSelectionOption.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.createNewApp = this.createNewApp.bind(this);
    this.togglePassword = this.togglePassword.bind(this);
    this.renderFormInstances = this.renderFormInstances.bind(this);
    this.renderInnerForm = this.renderInnerForm.bind(this);
    this.toggleInstance = this.toggleInstance.bind(this);
    this.renderFormInstances = this.renderFormInstances.bind(this);
    this.handleNewChange = this.handleNewChange.bind(this);
    this.addInstance = this.addInstance.bind(this);
    this.deleteInstance = this.deleteInstance.bind(this);
    this.handleReplicasChange = this.handleReplicasChange.bind(this);
    this.handleFileInputChange = this.handleFileInputChange.bind(this);
    this.handleMicroSFileInputChange =
      this.handleMicroSFileInputChange.bind(this);
    this.handleDismiss = this.handleDismiss.bind(this);
  }

  handleOnChange(position) {
    const { SelectedClusters } = this.state;
    this.setState({
      SelectedClusters: SelectedClusters.map((item, index) =>
        index === position ? !item : item
      ),
    });
  }
  changeMultiSelectionOption() {
    const { multiCluster } = this.state;
    this.setState({
      multiCluster: !multiCluster,
    });
  }

  toggleDefaultDeployment() {
    this.setState({ currentDeploymentMethod: "default" });
  }

  toggleMiraDeployment() {
    this.setState({ currentDeploymentMethod: "mira" });
  }

  toggleMicroservice() {
    this.setState({ currentDeploymentMethod: "microservice" });
  }

  componentDidMount() {
    if (this.myRef.current) {
      this.myRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  componentDidUpdate(prevProps) {
    const {
      isCreated,
      params: { projectID },
    } = this.props;

    if (isCreated !== prevProps.isCreated) {
      return <Redirect to={`/projects/${projectID}/Apps`} noThrow />;
    }
  }

  showForm() {
    this.setState({ openModal: true });
  }

  hideForm() {
    this.setState(this.initialState);
  }

  togglePassword() {
    //this.setState({ hidden: !this.state.hidden });
    this.setState({ passwordShown: !this.state.passwordShown });
  }

  validateDomainName(domainName) {
    const expression =
      /[-a-zA-Z0-9@:%._~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_.~#?&//=]*)?/gi;
    const regex = new RegExp(expression);
    if (regex.test(domainName)) {
      if (domainName.match(!regex)) {
        return "false_convention";
      }
      return true;
    }
    return false;
  }

  handleChange(e) {
    const { error, createFeedback } = this.state;
    this.setState({
      [e.target.name]: e.target.value,
    });
    if (error) {
      this.setState({
        error: "",
      });
    }
    if (createFeedback) {
      this.setState({
        createFeedback: "",
      });
    }
  }

  handleDockerCredentialsChange({ target, target: { value } }) {
    const { dockerCredentials } = this.state;
    this.setState((prevState) => ({
      dockerCredentials: {
        ...prevState.dockerCredentials,
        [target.name]: value,
      },
    }));
    if (dockerCredentials.error) {
      this.setState((prevState) => ({
        dockerCredentials: {
          ...prevState.dockerCredentials,
          error: "",
        },
      }));
    }
  }

  addEnvVar() {
    const { varName, varValue } = this.state;

    if (varName && varValue) {
      this.setState((prevState) => ({
        envVars: {
          ...prevState.envVars,
          [varName]: varValue,
        },
      }));
      this.setState({
        varName: "",
        varValue: "",
      });
    }
  }

  addMicroserviceEnvVar = (instanceId) => {
    let { formInstances } = this.state;

    const updatedInstances = formInstances.map((instance) => {
      if (instance.id === instanceId) {
        let { varName, varValue } = instance.formData;
        let updatedEnvVars = {
          ...instance.formData.envVars,
          [varName]: varValue,
        };

        return {
          ...instance,
          formData: { ...instance.formData, envVars: updatedEnvVars },
        };
      }
      return instance;
    });

    this.setState({
      formInstances: updatedInstances,
      varName: "",
      varValue: "",
    });
  };

  removeMicroserviceEnvVar = (instanceId, varNameToRemove) => {
    this.setState((prevState) => {
      const updatedFormInstances = prevState.formInstances.map((instance) => {
        if (instance.id === instanceId) {
          const updatedEnvVars = { ...instance.formData.envVars };
          delete updatedEnvVars[varNameToRemove];
          return {
            ...instance,
            formData: { ...instance.formData, envVars: updatedEnvVars },
          };
        }
        return instance;
      });

      return { formInstances: updatedFormInstances };
    });
  };

  removeEnvVar(index) {
    const { envVars } = this.state;
    const keyToRemove = Object.keys(envVars)[index];
    const newEnvVars = Object.keys(envVars).reduce((object, key) => {
      if (key !== keyToRemove) {
        object[key] = envVars[key]; // eslint-disable-line no-param-reassign
      }
      return object;
    }, {});

    this.setState({ envVars: newEnvVars });
  }

  togglePrivateImage() {
    const { isPrivateImage } = this.state;
    this.setState({
      isPrivateImage: !isPrivateImage,
    });
  }

  toggleCustomDomain() {
    const { isCustomDomain } = this.state;
    this.setState({
      isCustomDomain: !isCustomDomain,
    });
  }

  handleSelectReplicas(selected) {
    this.setState({ replicas: selected.id });
  }

  handleDismiss() {
    this.setState({ error: "" });
  }

  handleSubmit() {
    const {
      name,
      uri,
      envVars,
      entryCommand,
      port,
      isPrivateImage,
      dockerCredentials: { username, email, password, server },
      isCustomDomain,
      domainName,
      replicas,
      fileEnvContent,
    } = this.state;
    const { createApp, params } = this.props;

    if (!name || !uri) {
      // if user tries to submit empty email/password
      this.setState({
        error: "App name & Image URI are required",
      });
    } else if (validateName(name) === false) {
      this.setState({
        error: "Name should start with a letter",
      });
    } else if (validateName(name) === "false_convention") {
      this.setState({
        error:
          "Name may only contain letters, numbers, dot (.) and a hypen (-)",
      });
    } else if (name.length > 27) {
      this.setState({
        error: "Name may not exceed 27 characters",
      });
    } else if (port && !/^[0-9]*$/.test(port)) {
      // validate port and ensure its a number
      this.setState({
        error: "Port should be an integer",
      });
    } else if (
      isPrivateImage &&
      (!email || !username || !password || !server)
    ) {
      this.setState((prevState) => ({
        dockerCredentials: {
          ...prevState.dockerCredentials,
          error: "please provide all the information above",
        },
      }));
    } else if (isCustomDomain && !domainName) {
      this.setState({
        error: "Please enter a domain name",
      });
    } else if (domainName && this.validateDomainName(domainName) === false) {
      this.setState({
        error: "Domain name should start with a letter",
      });
    } else if (
      domainName &&
      this.validateDomainName(domainName) === "false_convention"
    ) {
      this.setState({
        error: "Use accepted formats for example google.com, domain.ug",
      });
    } else {
      //if fileEnvContent is empty, parseEnvContent will return an empty object
      const environmentVariables = {
        ...envVars,
        ...parseEnvContent(fileEnvContent),
      };

      let appInfo = {
        command: entryCommand,
        env_vars: environmentVariables,
        image: uri,
        name,
        project_id: params.projectID,
        private_image: false,
        replicas,
      };

      if (isCustomDomain === true) {
        let sentDomainName = domainName.toLowerCase();
        if (port) {
          appInfo = { ...appInfo, port: parseInt(port, 10) };
        }

        if (isPrivateImage) {
          appInfo = {
            ...appInfo,
            docker_email: email,
            docker_username: username,
            docker_password: password,
            docker_server: server,
            private_image: true,
          };
        }
        appInfo = { ...appInfo, custom_domain: sentDomainName };

        createApp(appInfo, params.projectID);
      } else {
        if (port) {
          appInfo = { ...appInfo, port: parseInt(port, 10) };
        }

        if (isPrivateImage) {
          appInfo = {
            ...appInfo,
            docker_email: email,
            docker_username: username,
            docker_password: password,
            docker_server: server,
            private_image: true,
          };
        }

        this.createNewApp(appInfo, params.projectID);
      }
    }
  }

  addInstance = () => {
    const { formInstances } = this.state;
    const newInstanceId =
      formInstances.length > 0
        ? formInstances[formInstances.length - 1].id + 1
        : 1;
    const newInstances = [
      ...formInstances,
      { id: newInstanceId, isOpen: true },
    ];

    this.setState({ formInstances: newInstances });
  };

  deleteInstance = (instanceId) => {
    const { formInstances, instanceNameValues } = this.state;
    const filteredInstances = formInstances.filter(
      (instance) => instance.id !== instanceId
    );
    const updatedNameValues = { ...instanceNameValues };
    delete updatedNameValues[instanceId];

    this.setState({
      formInstances: filteredInstances,
      instanceNameValues: updatedNameValues,
    });
  };

  handleNewChange = (e, instanceId) => {
    const { name, value } = e.target;
    const { formInstances } = this.state;
    const updatedInstances = formInstances.map((instance) =>
      instance.id === instanceId
        ? {
            ...instance,
            isOpen: instance.isOpen,
            formData: { ...instance.formData, [name]: value },
          }
        : instance
    );

    this.setState({
      formInstances: updatedInstances,
    });
  };

  toggleInstance = (instanceId) => {
    const { formInstances } = this.state;
    const updatedInstances = formInstances.map((instance) =>
      instance.id === instanceId
        ? { ...instance, isOpen: !instance.isOpen }
        : instance
    );

    this.setState({ formInstances: updatedInstances });
  };

  // Function to remove environment variable from other apps
  removeEnvVarFromOtherApps = (instanceId, varNameOtherApps) => {
    this.setState((prevState) => {
      const updatedFormInstances = prevState.formInstances.map((instance) => {
        if (instance.id === instanceId) {
          const updatedOtherAppEnvVars = { ...instance.otherAppEnvVars };
          delete updatedOtherAppEnvVars[varNameOtherApps];

          return {
            ...instance,
            formData: {
              ...instance.formData,
              otherAppEnvVars: updatedOtherAppEnvVars,
            },
          };
        }
        return instance;
      });

      return { formInstances: updatedFormInstances };
    });
  };

  // Function to add environment variable to other apps
  addEnvVarFromOtherApps = (instanceId) => {
    const { formInstances } = this.state;

    const updatedInstances = formInstances.map((instance) => {
      if (instance.id === instanceId) {
        let { varNameOtherApps, varValueOtherApps } = instance.formData;
        const updatedEnvVars = {
          ...instance.formData.otherAppEnvVars,
          [varNameOtherApps]: varValueOtherApps,
        };

        return {
          ...instance,
          formData: { ...instance.formData, otherAppEnvVars: updatedEnvVars },
        };
      }
      return instance;
    });

    this.setState({ formInstances: updatedInstances });
  };

  renderFormInstances = () => {
    const { formInstances, addingApp } = this.state;

    return (
      <div className={styles.WhiteBackground}>
        {formInstances.map((instance) => (
          <div key={instance.id}>
            <div
              onClick={() => this.toggleInstance(instance.id)}
              className={styles.MSAAdd}
            >
              App {instance.id}
              {!instance.isOpen && instance.formData && (
                <>
                  <div>Name: {instance.formData.name}</div>
                  <div>Image: {instance.formData.uri}</div>
                </>
              )}
            </div>
            {instance.isOpen && this.renderInnerForm(instance.id)}
          </div>
        ))}
        <PrimaryButton
          onClick={this.addInstance}
          color="primary"
          className={styles.MSAApp}
        >
          Add App
        </PrimaryButton>
        <PrimaryButton
          className={styles.MSFWidth}
          onClick={this.handleMicroseviceSubmit}
        >
          {addingApp ? <Spinner /> : "deploy"}
        </PrimaryButton>
        {/* <button onClick={this.addInstance}>Add New Instance</button> */}
      </div>
    );
  };

  handleVarValueOtherAppsChange = (e, instanceId) => {
    const { value } = e.target;

    this.setState((prevState) => ({
      formInstances: prevState.formInstances.map((instance) => {
        if (instance.id === instanceId) {
          return {
            ...instance,
            varValueOtherApps: value,
          };
        }
        return instance;
      }),
    }));
  };

  handleReplicasChange = (selectedOption, instanceId) => {
    const { formInstances } = this.state;

    const updatedInstances = formInstances.map((instance) => {
      if (instance.id === instanceId) {
        return {
          ...instance,
          formData: {
            ...instance.formData,
            replicas: selectedOption.id,
          },
        };
      }
      return instance;
    });

    this.setState({ formInstances: updatedInstances });
  };

  handleMicroSFileInputChange(e, instanceId) {
    const { formInstances } = this.state;
    const updatedInstances = formInstances.map((instance) => {
      if (instance.id === instanceId) {
        return {
          ...instance,
          formData: {
            ...instance.formData,
            envFileContent: e.target.value,
          },
        };
      }
      return instance;
    });

    this.setState({ formInstances: updatedInstances });
  }

  renderInnerForm = (instanceId) => {
    const { formInstances } = this.state;

    let {
      name,
      uri,
      isPrivateImage,
      username,
      email,
      password,
      server,
      port,
      entryCommand,
      varName,
      varNameOtherApps,
      varValueOtherApps,
      varValue,
      envVars,
      otherAppEnvVars,
      envFileContent,
      //replicas,
    } =
      formInstances.find((instance) => instance.id === instanceId)?.formData ||
      {};

    // const isOpen = this.state.formInstances.find(
    //   (instance) => instance.id === instanceId
    // )?.isOpen;
    // const hasValues = isOpen && name && uri;

    let otherInstanceNames = formInstances
      .filter((instance) => instance.id !== instanceId && instance.formData)
      .map((instance) => instance.formData?.name || "");

    return (
      <div>
        <div className={styles.ModalFormInputs}>
          <div className={styles.FormHeading}>Fields marked * are required</div>
          <div className={styles.ModalFormInputsBasic}>
            <BlackInputText
              required
              placeholder="Name"
              name="name"
              value={name}
              onChange={(e) => this.handleNewChange(e, instanceId)}
              className="ReplicasSelect"
            />

            <div className={styles.ReplicasSelect}>
              <Select
                placeholder="Number of Replicas - defaults to 1"
                options={replicaOptions}
                onChange={(selectedOption) =>
                  this.handleReplicasChange(selectedOption, instanceId)
                }
              />
            </div>

            <div className={styles.InputFieldWithTooltip}>
              <BlackInputText
                required
                placeholder="Image URI"
                name="uri"
                value={uri}
                onChange={(e) => this.handleNewChange(e, instanceId)}
              />
              <div className={styles.InputTooltipContainer}>
                <Tooltip
                  showIcon
                  message="Image URI e.g for docker: ngnixdemos/hello with ngnixdemos being your username and hello being the image name"
                  position="left"
                />
              </div>
            </div>

            <div className={styles.PrivateImageCheckField}>
              <Checkbox
                isBlack
                onClick={this.togglePrivateImage}
                isChecked={isPrivateImage}
              />
              &nbsp; Private Image
            </div>

            {isPrivateImage && (
              <div className={styles.PrivateImageTabContainer}>
                <Tabs>
                  <div index={1} /* label={<DockerLogo />} */>
                    <div className={styles.PrivateImageInputs}>
                      <BlackInputText
                        required
                        placeholder="Username"
                        name="username"
                        value={username}
                        onChange={(e) => {
                          this.handleDockerCredentialsChange(e);
                        }}
                      />

                      <BlackInputText
                        required
                        placeholder="Email"
                        name="email"
                        value={email}
                        onChange={(e) => {
                          this.handleDockerCredentialsChange(e);
                        }}
                      />
                      <div className="password-wrappers">
                        <BlackInputText
                          required
                          placeholder="Password"
                          name="password"
                          type={true ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            this.handleDockerCredentialsChange(e);
                          }}
                        />

                        <div className="password" onClick={this.togglePassword}>
                          {true ? <Open /> : <Closed />}
                        </div>
                      </div>
                      <div className={styles.InputFieldWithTooltip}>
                        <BlackInputText
                          required
                          placeholder="Registry Server"
                          name="server"
                          value={server}
                          onChange={(e) => {
                            this.handleDockerCredentialsChange(e);
                          }}
                        />
                        <div className={styles.InputTooltipContainerDB}>
                          <Tooltip
                            showIcon
                            message="Registry server for example: docker.io or gcr.io"
                            position="left"
                          />
                        </div>
                      </div>

                      {/* {dockerCredentials.error && (
                        <Feedback
                          type="error"
                          message={dockerCredentials.error}
                        />
                      )} */}
                    </div>
                  </div>
                </Tabs>
              </div>
            )}

            {/* {multiCluster && (
              <div className={styles.ClustersSection}>
                <div className={styles.MultiSelectionText}>
                  Please select a datacenter(s) you would like your app to be
                  deployed to.
                </div>
                <div className={styles.Multipleclusters}>
                  {clusters.map(({ name, id }, index) => {
                    return (
                      <li className={styles.ListStyle} key={index}>
                        <div className={styles.clusterListItem}>
                          <div className={styles.leftsection}>
                            <input
                              type="checkbox"
                              id={id}
                              name={name}
                              value={name}
                              checked={SelectedClusters[index]}
                              onChange={() => this.handleOnChange(index)}
                            />
                            <label className={styles.ClusterLabel} htmlFor={id}>
                              {name}
                            </label>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </div>
              </div>
            )}

            {beta && (
              <div className={styles.CustomDomainCheckField}>
                <Checkbox
                  isBlack
                  onClick={this.toggleCustomDomain}
                  isChecked={isCustomDomain}
                />
                &nbsp; Custom Domain
              </div>
            )}

            {isCustomDomain && (
              <div className={styles.CustomDomainTabContainer}>
                <Tabs>
                  <div index={1}>
                    <div className={styles.InputFieldWithTooltip}>
                      <BlackInputText
                        required
                        placeholder="Domain name"
                        name="domainName"
                        value={domainName}
                        onChange={(e) => {
                          this.handleChange(e);
                        }}
                      />
                      <div className={styles.InputTooltipContainer}>
                        <Tooltip
                          showIcon
                          message="You will be given IP addresses to link your hosting provider DNS to our servers"
                          position="left"
                        />
                      </div>
                    </div>
                  </div>
                </Tabs>
              </div>
            )} */}

            <div className={styles.InputFieldWithTooltip}>
              <BlackInputText
                placeholder="Entry Command"
                name="entryCommand"
                value={entryCommand}
                onChange={(e) => this.handleNewChange(e, instanceId)}
              />
              <div className={styles.InputTooltipContainer}>
                <Tooltip
                  showIcon
                  message="Entrypoint or command for your container"
                  position="left"
                />
              </div>
            </div>
            <div className={styles.InputFieldWithTooltip}>
              <BlackInputText
                placeholder="Port (optional) - defaults to 80"
                name="port"
                value={port}
                onChange={(e) => this.handleNewChange(e, instanceId)}
              />
              <div className={styles.InputTooltipContainer}>
                <Tooltip
                  showIcon
                  message="Exposed port of your container"
                  position="left"
                />
              </div>
            </div>
          </div>

          <div className={styles.ModalFormInputsEnvVars}>
            <div className={styles.HeadingWithTooltip}>
              <h4>Environment Variables</h4>
              <Tooltip
                showIcon
                message="These are are key/value pairs which define aspects of your app’s environment that can vary"
              />
            </div>
            {envVars && Object.keys(envVars).length > 0 && (
              <div className={styles.EnvVarsTable}>
                <table>
                  <thead>
                    <tr>
                      <td>Name</td>
                      <td>Value</td>
                      <td>Remove</td>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(envVars).map(([name, value]) => (
                      <tr key={name}>
                        <td>{name}</td>
                        <td>{value}</td>
                        <td>
                          <img
                            src={RemoveIcon}
                            alt="remove_ico"
                            onClick={() =>
                              this.removeMicroserviceEnvVar(instanceId, name)
                            }
                            role="presentation"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="EnvInputItem">
              <div className="VarInputGroup">
                <BlackInputText
                  placeholder="Key"
                  name="varName"
                  value={varName}
                  onChange={(e) => this.handleNewChange(e, instanceId)}
                  className="settings-input name-input"
                />
                <BlackInputText
                  placeholder="Value"
                  name="varValue"
                  className="settings-input value-input"
                  style={{ flex: 1 }}
                  value={varValue}
                  onChange={(e) => this.handleNewChange(e, instanceId)}
                />
              </div>
              <div className="EnvVarsAddBtn">
                <PrimaryButton
                  onClick={() => this.addMicroserviceEnvVar(instanceId)}
                  color="primary"
                  small
                >
                  Add
                </PrimaryButton>
              </div>
            </div>
            <div
              style={{ marginTop: "5px" }}
              className={styles.HeadingWithTooltip}
            >
              <h4>Paste Environment variables from a file.</h4>
              <Tooltip
                showIcon
                message="Environment variables will be extracted from the file content provided"
              />
            </div>
            <textarea
              rows="2"
              cols="50"
              placeholder="Paste your .env content here"
              value={envFileContent}
              onChange={(e) => this.handleMicroSFileInputChange(e, instanceId)}
              onFocus={(e) => (e.target.rows = 10)}
              onBlur={(e) => (e.target.rows = 2)}
              className={styles.envFileInput}
            />
          </div>

          <div className={styles.ModalFormInputsEnvVars}>
            <div className={styles.HeadingWithTooltip}>
              <h4>Environment Variables from other apps</h4>
              <Tooltip
                showIcon
                message="These are are key/value pairs which define aspects of your app’s environment that can vary"
              />
            </div>
            {otherAppEnvVars && Object.keys(otherAppEnvVars).length > 0 && (
              <div className={styles.EnvVarsTable}>
                <table>
                  <thead>
                    <tr>
                      <td>Name</td>
                      <td>Value</td>
                      <td>Remove</td>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(otherAppEnvVars).map(([name, value]) => (
                      <tr key={name}>
                        <td>{name}</td>
                        <td>{value}</td>
                        <td>
                          <img
                            src={RemoveIcon}
                            alt="remove_ico"
                            onClick={() =>
                              this.removeEnvVarFromOtherApps(instanceId, name)
                            }
                            role="presentation"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className={styles.EnvVarsInputGroup}>
              <div className={styles.EnvVarsInputs}>
                <BlackInputText
                  placeholder="Name"
                  name="varNameOtherApps"
                  value={varNameOtherApps}
                  onChange={(e) => this.handleNewChange(e, instanceId)}
                />
                <select
                  name="varValueOtherApps"
                  value={varValueOtherApps}
                  onChange={(e) => this.handleNewChange(e, instanceId)}
                >
                  <option value="">Select an App</option>
                  {otherInstanceNames.map((instanceName) => (
                    <option key={instanceName} value={instanceName}>
                      {instanceName}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.EnvVarsAddBtn}>
                <PrimaryButton
                  onClick={() => this.addEnvVarFromOtherApps(instanceId)}
                  className={styles.EnvVarAddBtn}
                >
                  Add
                </PrimaryButton>
              </div>
            </div>
          </div>
          <div className={styles.ModalFormButtons}>
            <div className={styles.ButtonSection}>
              <PrimaryButton
                className="AuthBtn"
                color="red"
                onClick={() => this.deleteInstance(instanceId)}
              >
                Delete App
              </PrimaryButton>
            </div>
          </div>
        </div>
        <hr style={{ width: "100%" }} />
      </div>
    );
  };
  handleMicroseviceSubmit = () => {
    const { formInstances } = this.state;
    const { params } = this.props;

    let allFormData = formInstances.map((instance) => {
      const formData = instance.formData;
      const filteredData = {};

      if (formData.name) filteredData.name = formData.name;
      if (formData.replicas) filteredData.replicas = formData.replicas;
      if (formData.uri) filteredData.uri = formData.uri;
      if (formData.isPrivateImage)
        filteredData.isPrivateImage = formData.isPrivateImage;
      if (formData.username) filteredData.username = formData.username;
      if (formData.email) filteredData.email = formData.email;
      if (formData.password) filteredData.password = formData.password;
      if (formData.server) filteredData.server = formData.server;
      if (formData.port) filteredData.port = formData.port;
      if (formData.entryCommand)
        filteredData.entryCommand = formData.entryCommand;
      if (formData.varName) filteredData.varName = formData.varName;
      if (formData.varNameOtherApps)
        filteredData.varNameOtherApps = formData.varNameOtherApps;
      if (formData.envFileContent) {
        filteredData.envFileContent = formData.envFileContent;
        filteredData.envVars = {
          ...(formData.envVars || {}),
          ...parseEnvContent(formData.envFileContent),
        };
      } else if (Object.keys(formData.envVars || {}).length > 0) {
        filteredData.envVars = formData.envVars;
      }
      if (Object.keys(formData.otherAppEnvVars || {}).length > 0)
        filteredData.otherAppEnvVars = formData.otherAppEnvVars;

      return filteredData;
    });

    const payload = {
      apps: allFormData.map((data) => ({
        ...data,
        image: data.uri,
        dependant_env_vars: data.otherAppEnvVars,
      })),
    };
    this.setState({
      addingApp: true,
      error: "",
    });
    handlePostRequestWithOutDataObject(
      payload,
      `/projects/${params?.projectID}/apps`
    )
      .then(() => {
        window.location.href = `/projects/${params?.projectID}/apps`;
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          error: "Failed to add Apps. Try again later",
          addingApp: false,
          addErrorCode: error.response?.status,
        });
      });
  };

  createNewApp(data, projectID) {
    this.setState({
      addingApp: true,
      error: "",
    });
    handlePostRequestWithOutDataObject(data, `/projects/${projectID}/apps`)
      .then(() => {
        window.location.href = `/projects/${projectID}/apps`;
      })
      .catch((error) => {
        this.setState({
          error: error.response.data.message,
          addingApp: false,
          addErrorCode: error.response?.status,
        });
      });
  }
  handleFileInputChange(e) {
    this.setState({ fileEnvContent: e.target.value });
  }

  render() {
    const {
      params: { projectID },
      data: { beta },
      clusters: { clusters },
    } = this.props;
    const {
      name,
      uri,
      varName,
      varValue,
      envVars,
      error,
      entryCommand,
      port,
      isPrivateImage,
      dockerCredentials,
      dockerCredentials: { username, email, password, server },
      isCustomDomain,
      currentDeploymentMethod,
      domainName,
      multiCluster,
      SelectedClusters,
      addingApp,
      addErrorCode,
      passwordShown,
      fileEnvContent,
    } = this.state;

    return (
      <div ref={this.myRef} className={styles.CenterForm}>
        <div className={styles.DeploymentMethodTabs}>
          <span
            className={
              currentDeploymentMethod === "default"
                ? styles.CurrentTab
                : styles.Tab
            }
            onClick={this.toggleDefaultDeployment}
          >
            Deploy Single App
          </span>
          <span
            className={
              currentDeploymentMethod === "mira"
                ? styles.CurrentTab
                : styles.Tab
            }
            onClick={this.toggleMiraDeployment}
          >
            Deploy with mira
          </span>
          <span
            className={
              currentDeploymentMethod === "microservice"
                ? styles.CurrentTab
                : styles.Tab
            }
            onClick={this.toggleMicroservice}
          >
            Deploy Micro-services
          </span>
        </div>

        {currentDeploymentMethod === "default" && (
          <div className={styles.CreateFormHolder}>
            <div className={styles.ModalFormInputs}>
              <div className={styles.FormHeading}>
                Fields marked * are required
              </div>
              <div className={styles.ModalFormInputsBasic}>
                <BlackInputText
                  required
                  placeholder="Name"
                  name="name"
                  value={name}
                  onChange={(e) => {
                    this.handleChange(e);
                  }}
                  className="ReplicasSelect"
                />

                <div className={styles.ReplicasSelect}>
                  <Select
                    placeholder="Number of Replicas - defaults to 1"
                    options={replicaOptions}
                    onChange={this.handleSelectReplicas}
                  />
                </div>

                <div className={styles.InputFieldWithTooltip}>
                  <BlackInputText
                    required
                    placeholder="Image URI"
                    name="uri"
                    value={uri}
                    onChange={(e) => {
                      this.handleChange(e);
                    }}
                  />
                  <div className={styles.InputTooltipContainer}>
                    <Tooltip
                      showIcon
                      message="Image URI e.g for docker: ngnixdemos/hello with ngnixdemos being your username and hello being the image name"
                      position="left"
                    />
                  </div>
                </div>

                <div className={styles.PrivateImageCheckField}>
                  <Checkbox
                    isBlack
                    onClick={this.togglePrivateImage}
                    isChecked={isPrivateImage}
                  />
                  &nbsp; Private Image
                </div>

                {isPrivateImage && (
                  <div className={styles.PrivateImageTabContainer}>
                    <Tabs>
                      <div index={1} /* label={<DockerLogo />} */>
                        <div className={styles.PrivateImageInputs}>
                          <BlackInputText
                            required
                            placeholder="Username"
                            name="username"
                            value={username}
                            onChange={(e) => {
                              this.handleDockerCredentialsChange(e);
                            }}
                          />

                          <BlackInputText
                            required
                            placeholder="Email"
                            name="email"
                            value={email}
                            onChange={(e) => {
                              this.handleDockerCredentialsChange(e);
                            }}
                          />
                          <div className="password-wrappers">
                            <BlackInputText
                              required
                              placeholder="Password"
                              name="password"
                              type={passwordShown ? "text" : "password"}
                              value={password}
                              onChange={(e) => {
                                this.handleDockerCredentialsChange(e);
                              }}
                            />

                            <div
                              className="password"
                              onClick={this.togglePassword}
                            >
                              {passwordShown ? <Open /> : <Closed />}
                            </div>
                          </div>
                          <div className={styles.InputFieldWithTooltip}>
                            <BlackInputText
                              required
                              placeholder="Registry Server"
                              name="server"
                              value={server}
                              onChange={(e) => {
                                this.handleDockerCredentialsChange(e);
                              }}
                            />
                            <div className={styles.InputTooltipContainerDB}>
                              <Tooltip
                                showIcon
                                message="Registry server for example: docker.io or gcr.io"
                                position="left"
                              />
                            </div>
                          </div>

                          {dockerCredentials.error && (
                            <Feedback
                              type="error"
                              message={dockerCredentials.error}
                            />
                          )}
                        </div>
                      </div>
                    </Tabs>
                  </div>
                )}

                {multiCluster && (
                  <div className={styles.ClustersSection}>
                    <div className={styles.MultiSelectionText}>
                      Please select a datacenter(s) you would like your app to
                      be deployed to.
                    </div>
                    <div className={styles.Multipleclusters}>
                      {clusters.map(({ name, id }, index) => {
                        return (
                          <li className={styles.ListStyle} key={index}>
                            <div className={styles.clusterListItem}>
                              <div className={styles.leftsection}>
                                <input
                                  type="checkbox"
                                  id={id}
                                  name={name}
                                  value={name}
                                  checked={SelectedClusters[index]}
                                  onChange={() => this.handleOnChange(index)}
                                />
                                <label
                                  className={styles.ClusterLabel}
                                  htmlFor={id}
                                >
                                  {name}
                                </label>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </div>
                  </div>
                )}

                {beta && (
                  <div className={styles.CustomDomainCheckField}>
                    <Checkbox
                      isBlack
                      onClick={this.toggleCustomDomain}
                      isChecked={isCustomDomain}
                    />
                    &nbsp; Custom Domain
                  </div>
                )}

                {isCustomDomain && (
                  <div className={styles.CustomDomainTabContainer}>
                    <Tabs>
                      <div index={1}>
                        <div className={styles.InputFieldWithTooltip}>
                          <BlackInputText
                            required
                            placeholder="Domain name"
                            name="domainName"
                            value={domainName}
                            onChange={(e) => {
                              this.handleChange(e);
                            }}
                          />
                          <div className={styles.InputTooltipContainer}>
                            <Tooltip
                              showIcon
                              message="You will be given IP addresses to link your hosting provider DNS to our servers"
                              position="left"
                            />
                          </div>
                        </div>
                      </div>
                    </Tabs>
                  </div>
                )}

                <div className={styles.InputFieldWithTooltip}>
                  <BlackInputText
                    placeholder="Entry Command"
                    name="entryCommand"
                    value={entryCommand}
                    onChange={(e) => {
                      this.handleChange(e);
                    }}
                  />
                  <div className={styles.InputTooltipContainer}>
                    <Tooltip
                      showIcon
                      message="Entrypoint or command for your container"
                      position="left"
                    />
                  </div>
                </div>
                <div className={styles.InputFieldWithTooltip}>
                  <BlackInputText
                    placeholder="Port (optional) - defaults to 80"
                    name="port"
                    value={port}
                    onChange={(e) => {
                      this.handleChange(e);
                    }}
                  />
                  <div className={styles.InputTooltipContainer}>
                    <Tooltip
                      showIcon
                      message="Exposed port of your container"
                      position="left"
                    />
                  </div>
                </div>
              </div>
              <div className={styles.ModalFormInputsEnvVars}>
                <div className={styles.HeadingWithTooltip}>
                  <h4>Environment Variables</h4>
                  <Tooltip
                    showIcon
                    message="These are are key/value pairs which define aspects of your app’s environment that can vary"
                  />
                </div>
                {Object.keys(envVars).length > 0 && (
                  <div className={styles.EnvVarsTable}>
                    <table>
                      <thead>
                        <tr>
                          <td>Name</td>
                          <td>Value</td>
                          <td>Remove</td>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(envVars).map((envVar, index) => (
                          <tr key={uuidv4()}>
                            <td>{Object.keys(envVars)[index]}</td>
                            <td>{envVars[Object.keys(envVars)[index]]}</td>
                            <td>
                              <img
                                src={RemoveIcon}
                                alt="remove_ico"
                                onClick={() => this.removeEnvVar(index)}
                                role="presentation"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="EnvInputItem">
                  <div className="VarInputGroup">
                    <BlackInputText
                      placeholder="Key"
                      name="varName"
                      value={varName}
                      onChange={(e) => {
                        this.handleChange(e);
                      }}
                      className="settings-input name-input"
                    />
                    <BlackInputText
                      placeholder="Value"
                      name="varValue"
                      className="settings-input value-input"
                      style={{ flex: 1 }}
                      value={varValue}
                      onChange={(e) => {
                        this.handleChange(e);
                      }}
                    />
                  </div>
                  <div className="EnvVarsAddBtn">
                    <PrimaryButton
                      onClick={this.addEnvVar}
                      color="primary"
                      small
                    >
                      Add
                    </PrimaryButton>
                  </div>
                </div>
                <div
                  style={{ marginTop: "5px" }}
                  className={styles.HeadingWithTooltip}
                >
                  <h4>Paste Environment variables from a file.</h4>
                  <Tooltip
                    showIcon
                    message="Environment variables will be extracted from the file content provided"
                  />
                </div>
                <textarea
                  rows="2"
                  cols="50"
                  placeholder="Paste your .env content here"
                  value={fileEnvContent}
                  onChange={this.handleFileInputChange}
                  onFocus={(e) => (e.target.rows = 10)}
                  onBlur={(e) => (e.target.rows = 2)}
                  className={styles.envFileInput}
                />
              </div>
              <div className={styles.ModalFormButtons}>
                {error && (
                  <div className={styles.FeedbackSection}>
                    <Feedback
                      type="error"
                      message={
                        addErrorCode === 409
                          ? "Name already in use, please choose another and try again"
                          : error
                      }
                      onClose={this.handleDismiss}
                    />
                  </div>
                )}

                <div className={styles.ButtonSection}>
                  <PrimaryButton
                    className="AuthBtn FullWidth"
                    onClick={this.handleSubmit}
                  >
                    {addingApp ? <Spinner /> : "deploy"}
                  </PrimaryButton>
                </div>
                <AttentionComponent />
              </div>
            </div>
          </div>
        )}

        {currentDeploymentMethod === "mira" && (
          <MiraPage projectID={projectID} />
        )}

        {currentDeploymentMethod === "microservice" && (
          <div className={styles.CreateFormHolder}>
            {this.renderFormInstances()}
          </div>
        )}
      </div>
    );
  }
}
CreateApp.propTypes = {
  clusters: PropTypes.object,
  params: PropTypes.shape({}),
};

CreateApp.defaultProps = {
  clusters: [],
  params: {},
};

export const mapStateToProps = (state) => {
  const { data } = state.user;
  const { clusters } = state.clustersReducer;

  return {
    clusters,
    data,
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(CreateApp);
