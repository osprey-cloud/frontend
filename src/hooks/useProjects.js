import { useQuery } from "@tanstack/react-query";
import api from "./../axios";

export const useProjects = (page, keyword = "") => {
    let link;
    if (keyword) {
      link = `/projects?page=${page}&keywords=${keyword}`;
    } else {
      link = `/projects?page=${page}`;
    }
  
    return useQuery({
      queryFn: () => api.get(link),
      queryKey: ["userProjects"],
      meta: {
        errorMessage: "Failed to fetch projects",
      },
    });
  };