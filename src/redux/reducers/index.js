import { combineReducers } from "redux";
import clustersReducer from "./clusters";
import addClusterReducer from "./addCluster";
import user from "./user";
import clusterResourcesReducer from "./clusterResources";
import servicesReducer from "./services";
import pvsReducer from "./pvs";
import nodesReducer from "./nodes";
import pvcsReducer from "./pvcs";
import namespacesListReducer from "./namespacesList";
import podsReducer from "./pods";
import storageClassesReducer from "./storageClass";
import jobsReducer from "./jobs";
import getDeployments from "./getDeployments";
import adminProjectsReducer from "./adminProjects";
import appsListReducer from "./appsList";
import userProjectsReducer from "./userProjects";
import userActivitiesReducer from "./getUserActivities";
// import addProjectReducer from "./addProject";
// import createAppReducer from "./createApp";
// import deleteProjectReducer from "./deleteProject";
import deleteAppReducer from "./deleteApp";
import userDetailReducer from "./userDetails";
import usersListReducer from "./usersList";
// import updateProjectReducer from "./updateProject";
import projectMemoryReducer from "./projectMemory";
import projectCPUReducer from "./projectCPU";
import projectNetworkReducer from "./projectNetwork";
import appNetworkReducer from "./appNetwork";
import appCpuReducer from "./appCpu";
import appMemoryReducer from "./appMemoryReducer";
import projectDatabasesReducer from "./databaseList";
// import deleteDatabaseReducer from "./deleteDatabase";
// import resetDatabaseReducer from "./resetDatabase";
// import createDatabaseReducer from "./createDatabase";
// import updateDatabasePasswordReducer from "./updateDBPassword";
// import singleDBReducer from "./getSingleDB";
// import passwordReducer from "./getPassword";
import updateAppReducer from "./updateApp";
import singleAppReducer from "./getSingleApp";
import databasesReducer from "./getDatabases";
import appsSummaryReducer from "./appsSummary";
import usersSummaryReducer from "./usersSummary";
import revertUrlReducer from "./revertUrl";
import adminDatabasesReducer from "./adminGetDatabases";
import adminCreateDBReducer from "./adminCreateDB";
import getProjectBillReducer from "./getProjectBill";
import savePaymentReducer from "./savePayment";
import getTransactionsReducer from "./getTransactions";
import addBetaUserReducer from "./addBetaUser";
import updateClusterReducer from "./updateCluster";
import getInvoicesReducer from "./getInvoices";
import getReceiptsReducer from "./getReceipts";
import addUserCreditsReducer from "./addCredits";
import userCreditsReducer from "./userCredits";
import adminGetUserCreditsReducer from "./adminGetUserCredits";
import updateProfileReducer from "./updateProfile";
import creditsPaymentReducer from "./creditsPayments";
import getGraphDataReducer from "./getGraphData";
import adminGetInactiveUsersReducer from "./adminGetInactiveUsers";
import appsAdminListReducer from "./adminAppsList";
import appRevisionsReducer from "./getRevisions";
import userRecentActivitiesReducer from "./getUserRecentActivity";
// import inviteMembersReducer from "./inviteMembers";
//import removeMemberReducer from "./removeMembers";
// import updateMemberRoleReducer from "./updateMemberRole";

export default combineReducers({
  clusterResourcesReducer,
  clustersReducer,
  user,
  addClusterReducer,
  servicesReducer,
  storageClassesReducer,
  pvsReducer,
  nodesReducer,
  pvcsReducer,
  namespacesListReducer,
  podsReducer,
  deployments: getDeployments,
  jobsReducer,
  adminProjectsReducer,
  appsListReducer,
  userProjectsReducer,
  // addProjectReducer,
  // createAppReducer,
  deleteAppReducer,
  // deleteProjectReducer,
  userDetailReducer,
  usersListReducer,
  // updateProjectReducer,
  projectMemoryReducer,
  projectCPUReducer,
  projectNetworkReducer,
  appNetworkReducer,
  appCpuReducer,
  appMemoryReducer,
  projectDatabasesReducer,
  // deleteDatabaseReducer,
  // resetDatabaseReducer,
  // // createDatabaseReducer,
  // updateDatabasePasswordReducer,
  // singleDBReducer,
  // passwordReducer,
  updateAppReducer,
  singleAppReducer,
  databasesReducer,
  appsSummaryReducer,
  usersSummaryReducer,
  revertUrlReducer,
  adminDatabasesReducer,
  adminCreateDBReducer,
  getProjectBillReducer,
  savePaymentReducer,
  getTransactionsReducer,
  addBetaUserReducer,
  updateClusterReducer,
  getInvoicesReducer,
  getReceiptsReducer,
  addUserCreditsReducer,
  userCreditsReducer,
  adminGetUserCreditsReducer,
  updateProfileReducer,
  creditsPaymentReducer,
  getGraphDataReducer,
  adminGetInactiveUsersReducer,
  appsAdminListReducer,
  userActivitiesReducer,
  appRevisionsReducer,
  userRecentActivitiesReducer,
  // inviteMembersReducer,
  // removeMemberReducer,
  // updateMemberRoleReducer,
});
