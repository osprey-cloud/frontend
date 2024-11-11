import { useQuery } from "@tanstack/react-query";
import api from "../axios";

export const useProject = (id) => {
  return useQuery({
    queryFn: () => api.get(`/projects/${id}`),
    queryKey: ["project", id],
    meta: {
      errorMessage: "Failed to fetch project details",
    },
  });
};
