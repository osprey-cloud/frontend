import { useQuery } from "@tanstack/react-query";
import { databaseAxios } from "./../axios";

// get database stats for admin
export const useAdminDatabaseStats = () => {
  return useQuery({
    queryFn: () => databaseAxios.get("/databases/stats"),
    queryKey: ["adminDatabaseStats"],
    meta: {
      errorMessage: "Failed to fetch database stats",
    },
  });
};

// get database graph data for admin
export const useAdminDatabaseSeries = () => {
  return useQuery({
    queryFn: () => databaseAxios.get("/databases/graph"),
    queryKey: ["adminDatabaseSeries"],
    meta: {
      errorMessage: "Failed to fetch database series",
    },
  });
};

// get all databases for admin
export const useDatabaseList = (category = "", page, project_id = "") => {
  let link = `/databases?page=${page}`;

  if (category) {
    link += `&database_flavour_name=${category}`;
  }

  if (project_id) {
    link += `&project_id=${project_id}`;
  }
  return useQuery({
    queryFn: () => databaseAxios.get(link),
    queryKey: ["adminDatabaseList", category, page, project_id],
    meta: {
      errorMessage: "Failed to fetch all databases",
    },
  });
};

// get database details
export const useDatabaseDetails = (id) => {
  return useQuery({
    queryFn: () => databaseAxios.get(`/databases/${id}`),
    queryKey: ["databaseDetails", id],
    meta: {
      errorMessage: "Failed to fetch database details",
    },
  });
};
