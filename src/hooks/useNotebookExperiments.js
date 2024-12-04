import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mlopsAxios } from "./../axios";

// fetch all experiments
export const useExperimentList = () => {
  return useQuery({
    queryKey: ["experiments"],
    queryFn: async () => {
      const response = await mlopsAxios.get("/experiments");
      return response.data.data;
    },
  });
};

// fetch experiment details by ID
export const useExperimentDetails = (experimentId) => {
  return useQuery({
    queryKey: ["experiment", experimentId],
    queryFn: async () => {
      const response = await mlopsAxios.get(`/experiments/${experimentId}`);
      return response.data.data;
    },
    enabled: !!experimentId,
  });
};

// fetch experiment runs by experiment ID
export const useExperimentRuns = (experimentId) => {
  return useQuery({
    queryKey: ["experimentRuns", experimentId],
    queryFn: async () => {
      const response = await mlopsAxios.get(
        `/experiments/${experimentId}/runs`
      );
      return response.data.data;
    },
    enabled: !!experimentId,
  });
};

// fetch run details by ID
export const useExperimentRunDetails = (runId) => {
  return useQuery({
    queryKey: ["experimentRun", runId],
    queryFn: async () => {
      const response = await mlopsAxios.get(`/run/${runId}`);
      return response.data.data;
    },
    enabled: !!runId,
  });
};

// delete a notebook experiment run by ID
export const useExperimentRunDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (runId) => {
      const response = await mlopsAxios.delete(`/run/${runId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["experimentRuns"]);
    },
  });
};

// delete a notebook experiment by ID
export const useExperimentDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (experimentId) => {
      const response = await mlopsAxios.delete(`/experiments/${experimentId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["experiments"]);
    },
  });
};
