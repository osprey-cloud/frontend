import React,{ useState } from "react";
import Header from "../../components/Header";
import InformationBar from "../../components/InformationBar";
import styles from "./TagDetailsPage.module.css";
import FeaturedTagsSection from "../../components/DashboardTagsSection";
import { ReactComponent as ProjectMembers } from "../../assets/images/projects.svg";
import { ReactComponent as Calendar } from "../../assets/images/calendar.svg"
import { useTag } from "../../hooks/useTag";
import CreateProject from "../../components/CreateProject";
import { useParams } from "react-router-dom/cjs/react-router-dom.min.js";
import { dateInWords } from "../../helpers/dateConstants.js";
import { handleDeleteRequest } from "../../apis/apis";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../axios";
import Spinner from "../../components/Spinner/index.js";
import { Link } from "react-router-dom/cjs/react-router-dom.min.js";

const TagDetailsPage = () => {
  const [openCreateProject, setOpenCreateProject] = useState(false);
  const [isFollowing, setFollowing] = useState(false);
  const [followingProject, setFollowingProject] = useState(false);
  const [searchword, setSearchword] = useState("");

  const queryClient = useQueryClient();
  const {tagID}=useParams();
  const { data: tag, isLoading } = useTag(tagID);

  const project_id = tag?.data?.data?.projects.map((project)=>{
    return project.id
  })
  const filteredProjects = tag?.data?.data?.projects.filter((project) =>
    project.name.toLowerCase().includes(searchword.toLowerCase())
  );
  

  const followTagMutation = useMutation({
    mutationFn: () => axios.post(`tags/${tagID}/following`, {}),
    onMutate: () => {
      setFollowing(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tag", tagID],
      });
      setTimeout(() => {
        setFollowing(false);
      }, 2000);
    },
    onError:(error)=>{
      console("Failed to follow tag", error)
    }
  });

  const unfollowTagMutation = useMutation({
    mutationFn: () => handleDeleteRequest(`tags/${tagID}/following`, {}),
    onMutate: () => {
      setFollowing(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tag", tagID],
      });
      setTimeout(() => {
        setFollowing(false);
      }, 2000);
    },
    onError:(error)=>{
      console("Failed to unfollow tag", error)
    }
  });
  const handleFollow = (tagID) => {
    if (tag?.data?.data?.is_following) {
      setFollowing(true);
      unfollowTagMutation.mutate();
    } else {
      setFollowing(false);
      followTagMutation.mutate();
    }
  };

  const followProjectMutation = useMutation({
    mutationFn: (projectId) => axios.post(`projects/${projectId}/following`, {}),
    onMutate: () => {
      setFollowingProject(true)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:['project', project_id],
      });
      setTimeout(()=>{
        setFollowingProject(false)
      },2000)
    },
    onError:(error)=>{
      console("Failed to follow project", error)
    }
  });
  
  const unfollowProjectMutation = useMutation({
    mutationFn: (projectId) => handleDeleteRequest(`projects/${projectId}/following`, {}),
    onMutate: () => {
      setFollowingProject(false)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:['project', project_id]
    });
    setTimeout(()=>{
      setFollowingProject(false)
    })
    },
    onError:(error)=>{
      console("Failed to unfollow project", error)
    }
  });
  
  const handleProjectFollow = (project) => {
    if (project.is_following) {
      setFollowingProject(true)
      unfollowProjectMutation.mutate(project.id);
    } else {
      setFollowingProject(false)
      followProjectMutation.mutate(project.id);
    }
  };  
  

  if (isLoading)return <Spinner size="large"/>

 return (
  <>
    {openCreateProject ? (
      <CreateProject closeComponent={() => setOpenCreateProject(false)} />
    ) : (
      <>
        <div className="MainPage">
          <div className="Mainsection">
            <Header />
            <div className="MainContentSection">
              <div className="InformationBarSection">
                <InformationBar
                  header={
                  <span> 
                    <Link className="breadcrumb" to={`/dashboard`}>
                       Dashboard
                    </Link>
                    /Explore
                  </span>}
                  showBtn
                  showBackBtn
                  showSearchBar
                  searchAction={setSearchword}
                  placeholder="Search Tag projects"
                  buttontext="+ New Project"
                  btnAction={() => setOpenCreateProject(true)}
                />
              </div>
              {isLoading ? (
              // Display the spinner while page is loading
               <div className={styles.spinnerContainer}>
                  <Spinner size="large" />
               </div>
              ):(
              <div className="ContentSection">
                <div className={styles.dashboard}>
                  <div className={styles.tagDetailsSection}>
                    <div className={styles.tagDetailsHeader}>
                      <span className={styles.tagName}>
                        {tag?.data?.data?.name}
                      </span>
                      <button
                        className={styles.followButton}
                        onClick={() => handleFollow(tagID)}
                        disabled={isFollowing}
                      >
                        {isFollowing ? (
                          <Spinner size="small" />
                        ) : tag?.data?.data?.is_following ? (
                          "Unfollow"
                        ) : (
                          "+ Follow"
                        )}
                      </button>
                    </div>
                    <div className={styles.tagDetailsSubHeader}>
                      <span className={styles.iconSection}>
                        <ProjectMembers
                          className={styles.membersIcon}
                          title={"Tag followers"}
                        />
                        <div>{tag?.data?.data?.projects_count===1?
                        '1 Project':
                        `${tag?.data?.data?.projects_count || 0} Projects`}</div>
                      </span>
                      <span className={styles.iconSection}>
                        <Calendar
                          className={styles.membersIcon}
                          title={"Date Created"}
                        />
                        <div>
                          {dateInWords(new Date(tag?.data?.data?.date_created))}
                        </div>
                      </span>
                    </div>
                    <div className={styles.tagDetailsCard}>
                        {filteredProjects.length > 0 ? (
                           filteredProjects.map((project) => (
                             <div className={styles.card} key={project.id}>
                                 <div className={styles.cardContent}>
                                   <div className={styles.tagName}>{project.name}</div>
                                   <div className={styles.statItem}>
                                      <span>{project.description}</span>
                                   </div>
                                 </div>
                                 <div className={styles.followButtonArea}>
                                    <button
                                      className={styles.followButton}
                                      onClick={() => handleProjectFollow(project)}
                                      disabled={followingProject}
                                     >
                                      {followingProject ? (
                                      <Spinner size="small" />
                                      ) : project.is_following ? (
                                      "Unfollow"
                                      ) : (
                                      "+ Follow"
                                      )}
                                   </button>
                                 </div>
                              </div>
                             ))
                             ) : (
                             <div className={styles.noResults}>No projects match your search.</div>
                             )}
                     </div>
                  </div>

                  <div className={styles.moreTagsSection}>
                    <div className={styles.tagDetailsCard}>
                      <FeaturedTagsSection title="Related Tags" />
                    </div>
                  </div>
                </div>
              </div>
              )}
            </div>
            <div className={styles.FooterRow}>
              <div class={styles.textContainer}>
                Copyright {new Date().getFullYear()} Crane Cloud. All Rights
                Reserved. 
              </div> 
              <div>
                <a href="https://cranecloud.io/terms-of-service">Terms of Service </a>
                <a href="https://cranecloud.io/privacy-policy">Privacy Policy</a>
                <a href="https://app.cranecloud.io/status">Status</a>
                <a href="https://docs.cranecloud.io/">Docs</a>
                <a href="https://cranecloud.io/contact">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </>
     )}
    </>
)}

export default TagDetailsPage;
