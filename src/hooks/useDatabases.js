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
export const useAdminDatabaseList = (category = "") => {
  console.log("innnn");
  let link = `/databases`;
  if (category) {
    link += `?database_flavour_name=${category}`;
  }
  console.log(link);
  return useQuery({
    queryFn: () => databaseAxios.get(link),
    queryKey: ["adminDatabaseList", category],
    meta: {
      errorMessage: "Failed to fetch all databases",
    },
  });
};
