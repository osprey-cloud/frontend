import React, { useState } from "react";
import styles from "./TagCard.module.css";
import { ReactComponent as Stats } from "../../assets/images/bars.svg";
import Spinner from "../Spinner";
import axios from "../../axios";
import { handleDeleteRequest } from "../../apis/apis";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTag } from "../../hooks/useTag";
import { useHistory } from "react-router-dom";

const TagCard = ({ id, isModalTag, onClose }) => {
  const [isFollowing, setFollowing] = useState(false);
  
  const history = useHistory();

  const handleClick =()=>{
    history.push(`/tags/${tag?.data?.data?.id}/details`)
    if(onClose){ 
      onClose()
    }
  }

  const queryClient = useQueryClient();

  const { data: tag, isLoading } = useTag(id);
  if (isLoading) <p>loading...</p>;

  const followTagMutation = useMutation({
    mutationFn: () => axios.post(`tags/${id}/following`, {}),
    onMutate: () => {
      setFollowing(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tag", id],
      });
      setTimeout(() => {
        setFollowing(false);
      }, 2000);
    },
  });

  const unfollowTagMutation = useMutation({
    mutationFn: () => handleDeleteRequest(`tags/${id}/following`, {}),
    onMutate: () => {
      setFollowing(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tag", id],
      });
      setTimeout(() => {
        setFollowing(false);
      }, 2000);
    },
  });

  const handleFollow = (id) => {
    if (tag?.data?.data?.is_following) {
      setFollowing(true);
      unfollowTagMutation.mutate();
    } else {
      setFollowing(false);
      followTagMutation.mutate();
    }

  }

  return (
    <>
    {isLoading ?(
      <div className={styles.noActivity}>
          <div className={styles.NoResourcesMessage}>
            <div className={styles.SpinnerWrapper}>
              <Spinner size="small" />
            </div>
          </div>
        </div>
    ):(
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <div className={styles.tagName}
          onClick={handleClick}
        >
            {tag?.data?.data?.name}
        </div>
        {isModalTag && (
          <div className={styles.modalFollowButton}>
            <button
              className={styles.followButton}
              onClick={() => handleFollow(id)}
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
        )}
        <div className={styles.statItem}>
          <span>
            <Stats className={styles.stats} />{" "}
          </span>
          <span>
            {tag?.data?.data?.projects_count !== 0 &&
            tag?.data?.data?.projects_count === 1
              ? "1 project"
              : `${tag?.data?.data?.projects_count} projects`}
          </span>
        </div>
      </div>

      {!isModalTag && (
        <div className={styles.followButtonArea}>
          <button
            className={styles.followButton}
            onClick={() => handleFollow(id)}
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
      )}
    </div>
    )}
    </>
  );
};

export default TagCard;
