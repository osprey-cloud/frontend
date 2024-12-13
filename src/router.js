import React, { useEffect, useState } from "react";

import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";

import AdminDBList from "./components/AdminDB";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminProjectsPage from "./pages/AdminProjectsPage";
import AdminProjectOverviewPage from "./pages/AdminProjectOverviewPage";
import AdminUsersProfile from "./components/AdminUsersProfile";
import AdminUserLogs from "./components/AdminUserLogs";
import AdminProjectDetails from "./components/AdminProjectDetails";
import App from "./components/App";
import AppLogsPage from "./pages/AppLogsPage";
import AppMemoryPage from "./pages/AppMemoryPage";
import AppNetworkPage from "./pages/AppNetworkPage";
import AppSettingsPage from "./pages/AppSettingsPage";
import AppsPage from "./pages/AppsPage";
import ClusterPage from "./pages/ClusterPage";
import ClusterResourcesPage from "./pages/ClusterResourcesPage";
import ClusterSettingsPage from "./pages/ClusterSettingsPage";
import AdminLogsPage from "./pages/AdminLogsPage";
// import PricingPage from "./components/PricingPage";
import ContactPage from "./pages/ContactPage";
import CreateDatabase from "./components/CreateDatabase";
import CreateNewPassword from "./components/CreateNewPassword";
import DatabaseList from "./components/DatabaseList";
import DBSettingsPage from "./pages/DBSettingsPage";
import DeploymentsPage from "./pages/DeploymentsPage";
import Privacy from "./components/Documents/privacy";
import Terms from "./components/Documents/terms";
import JobsListPage from "./pages/JobsListPage";
// import App from "./components/App";
import LoginPage from "./pages/LoginPage";
import MonitoringPage from "./pages/MonitoringPage";
import NamespacesListPage from "./components/NamespacesList";
import ClusterNodes from "./components/NodesList";
import PageNotFound from "./components/PageNotFound";
import PasswordReset from "./components/PasswordReset";
import PodsList from "./components/PodsList";
import ProjectBillingPage from "./pages/ProjectBillingPage";
import ProjectCPUPage from "./pages/ProjectCPUPage";
import ProjectDashboardPage from "./pages/ProjectDashboardPage";
import ProjectMemoryPage from "./pages/ProjectMemoryPage";
import ProjectNetworkPage from "./pages/ProjectNetworkPage";
import PvcsList from "./components/PvcsList";
import PvsListPage from "./pages/PvsListPage";
import RegisterPage from "./pages/RegisterPage";
import ServicesListPage from "./components/ServicesList";
import StorageClassList from "./components/StorageClassList";
import TeamPage from "./pages/TeamPage";
import UsersAccounts from "./components/UserAccounts";
import UserProfile from "./components/UserProfile";
import VerificationSentPage from "./pages/VerificationSentPage";
import AppCpuPage from "./pages/AppCpuPage";
import AppMetricsPage from "./pages/AppMetricsPage";
import ProjectSettingsPage from "./pages/ProjectSettingsPage";
import UserProjectsPage from "./pages/UserProjectsPage";
import UserActivity from "./pages/UserActivity";
import ProjectLogs from "./pages/ProjectLogs";
import store from "./redux/store";
import AdminUserOverviewPage from "./pages/AdminUserOverviewPage";
// import AdminProjectsList from "./components/ProjectListing/ProjectList";
import AdminAppsPage from "./pages/AdminAppsPage";
import AdminProjectsOverview from "./components/ProjectListing/ProjectList";
import AdminDatabaseDetails from "./components/AdminDatabaseDetails";
import AdminAppDetail from "./pages/AdminAppDetail";
import DockerWebHook from "./components/DockerWebHook";
import UsersProfile from "./pages/UsersProfile";
import CreateAIAppPage from "./pages/createAIAppPage";

import { handleGetRequest } from "./apis/apis";
import UsersDashboardPage from "./pages/UsersDashboard";
import TagDetailsPage from "./pages/TagDetailsPage";

import NotebookExperimentPage from "./pages/NotebookExperimentPage";

// Protected route should have token. If not, login.
const ProtectedRoute = ({ isAllowed, ...props }) =>
  isAllowed ? <Route {...props} /> : <Redirect to="/" />;

// for now, existence of token will determine access to route
// later, this token will be a verified boolean
const currentUser = store.getState().user;
const hasToken = currentUser.accessToken;

const Routes = () => {
  const [isAdmin, setIsAdmin] = useState(true);
  useEffect(() => {
    //protect admin routes
    if (currentUser?.data?.id) {
      handleGetRequest(`/user/${currentUser?.data?.id}/roles`)
        .then((response) => {
          setIsAdmin(
            response.data.data.user_roles.some(
              (role) => role.name === "administrator"
            )
          );
        })
        .catch((error) => {
          //this means the user is unauthorized to access this endpoint
          //only admin token is authorized
          setIsAdmin(false);
        });
    }
  }, []);

  return (
    <Router>
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/login" component={LoginPage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/admin-login" component={AdminLoginPage} />
        <Route path="/forgot-password" component={PasswordReset} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/new-password" component={CreateNewPassword} />
        <Route path="/verify/:token" component={VerificationSentPage} />
        <Route path="/reset_password/:token" component={CreateNewPassword} />
        <Route path="/team" component={TeamPage} />
        <Route path="/create" component={CreateDatabase} />
        <Route path="/terms-of-service" component={Terms} />
        <Route path="/privacy-policy" component={Privacy} />
        <Route path="/status" component={MonitoringPage} />
        {/* projects */}
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/projects/:projectID/billing"
          component={ProjectBillingPage}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/dashboard"
          component={UsersDashboardPage}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/projects"
          component={UserProjectsPage}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/projects/:projectID/databases"
          component={DatabaseList}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/projects/:projectID/databases/:databaseID/settings"
          component={DBSettingsPage}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/projects/:projectID/apps"
          component={AppsPage}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/projects/:projectID/ai-apps"
          component={CreateAIAppPage}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/projects/:projectID/apps/:appID/network"
          component={AppNetworkPage}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/apps/:appID/webhook"
          component={DockerWebHook}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/projects/:projectID/apps/:appID/cpu"
          component={AppCpuPage}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/projects/:projectID/apps/:appID/memory"
          component={AppMemoryPage}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/projects/:projectID/apps/:appID/experiments"
          component={NotebookExperimentPage}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/projects/:projectID/apps/:appID/experiments/:experimentID/details"
          component={NotebookExperimentPage}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/projects/:projectID/apps/:appID/deployments"
          component={NotebookExperimentPage}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/projects/:projectID/apps/:appID/dashboard"
          component={AppMetricsPage}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/projects/:projectID/apps/:appID/settings"
          component={AppSettingsPage}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/projects/:projectID/apps/:appID/logs"
          component={AppLogsPage}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/projects/:projectID/databases"
          component={DatabaseList}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/projects/:projectID/memory/"
          component={ProjectMemoryPage}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/projects/:projectID/dashboard"
          component={ProjectDashboardPage}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/projects/:projectID/cpu/"
          component={ProjectCPUPage}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/projects/:projectID/network/"
          component={ProjectNetworkPage}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/projects/:projectID/settings"
          component={ProjectSettingsPage}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/tags/:tagID/details"
          component={TagDetailsPage}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          exact
          path="/accounts"
          component={AdminUserOverviewPage}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/profile"
          component={UserProfile}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          exact
          path="/accounts/:userID"
          component={AdminUsersProfile}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          exact
          path="/accounts/:userID/logs"
          component={AdminUserLogs}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          exact
          path="/projects/:projectID/details"
          component={AdminProjectDetails}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          exact
          path="/projects-overview/:projectID/details"
          component={AdminProjectDetails}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          path="/clusters/:clusterID/projects"
          component={AdminProjectOverviewPage}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          path="/clusters/:clusterID/projects-listing"
          component={AdminProjectsPage}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          path="/users-listing"
          component={UsersAccounts}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          path="/clusters/:clusterID/resources"
          component={ClusterResourcesPage}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          path="/clusters/:clusterID/services"
          component={ServicesListPage}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          path="/clusters/:clusterID/volumes"
          component={PvsListPage}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          path="/clusters/:clusterID/nodes"
          component={ClusterNodes}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          path="/clusters/:clusterID/pvcs"
          component={PvcsList}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          path="/clusters/:clusterID/namespaces"
          component={NamespacesListPage}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          path="/clusters/:clusterID/pods"
          component={PodsList}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          path="/clusters/:clusterID/storage-classes"
          component={StorageClassList}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          path="/clusters/:clusterID/jobs"
          component={JobsListPage}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          path="/clusters/:clusterID/deployments"
          component={DeploymentsPage}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          exact
          path="/clusters"
          component={ClusterPage}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          exact
          path="/databases"
          component={AdminDBList}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          exact
          path="/databases/:databaseID"
          component={AdminDatabaseDetails}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          exact
          path="/clusters/:clusterID/logs"
          component={AdminLogsPage}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          exact
          path="/clusters/:clusterID/clusterSettings"
          component={ClusterSettingsPage}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          exact
          path="/projects-overview"
          component={AdminProjectsOverview}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/projects/:projectID/activity"
          component={ProjectLogs}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/activity"
          component={UserActivity}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          exact
          path="/apps"
          component={AdminAppsPage}
        />
        <ProtectedRoute
          isAllowed={hasToken && isAdmin}
          exact
          path="/apps/:appID"
          component={AdminAppDetail}
        />
        <ProtectedRoute
          isAllowed={hasToken}
          exact
          path="/profile/:userID"
          component={UsersProfile}
        />
        <Route path="*" component={PageNotFound} />
      </Switch>
    </Router>
  );
};

export default Routes;
