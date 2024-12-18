import React, { useState } from "react";
import styles from "./NewUserCard.module.css";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import {
  handleDeleteRequest,
} from "../../apis/apis";
import Spinner from "../Spinner";
import axios from "../../axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserDetails } from "../../hooks/useUserDetails";

const NewUserCard = ({ userID, showFollowBtn = true }) => {
  const [userFollowLoading, setUserFollowLoading] = useState(false);

  const queryClient=useQueryClient();
  const {data:details, isLoading}= useUserDetails(userID)
  const userDetails = details?.data?.data?.user


  const unfollowUserMutation=useMutation({
    mutationFn:()=> handleDeleteRequest(`users/${userDetails.id}/following`, {}),
    onMutate:()=>{
      setUserFollowLoading(true);
    },
    onSuccess:()=>{
      queryClient.invalidateQueries({
        queryKey:["user",userID],
      })
      setTimeout(()=>{
        setUserFollowLoading(false);
      },2000);
    },
    onError:(error)=>{
      console("Error unfollowing user", error)
    }
  });

  const followUserMutation=useMutation({
    mutationFn:()=> axios.post(`users/${userDetails.id}/following`, {}),
    onMutate:()=>{
      setUserFollowLoading(true);
    },
    onSuccess:()=>{
      queryClient.invalidateQueries({
        queryKey:["user",userID],
      })
      setTimeout(()=>{
        setUserFollowLoading(false);
      },2000);
    },
    onError:(error)=>{
      console("Error following user", error)
    }
  });

  const onFollowClick = () => {
    if (userDetails.requesting_user_follows) {
      setUserFollowLoading(true);
      unfollowUserMutation.mutate();
        } else {
      setUserFollowLoading(false);
      followUserMutation.mutate();
    }
  };

  return (
    <>
      {isLoading ? (
        <div className={styles.noActivity}>
          <div className={styles.NoResourcesMessage}>
            <div className={styles.SpinnerWrapper}>
              <Spinner size="small" />
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.userCard}>
          <div className={styles.header}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>{userDetails?.name?.charAt(0).toUpperCase() ?? ""}</div>

              <div className={styles.usersubinfor}>

                <h3 className={styles.title}>
                  <Link
                    to={{
                      pathname: `/profile/${userDetails?.id}`,
                    }}
                    className={styles.linkBlue}
                  >
                    <strong>{userDetails?.name?.toLowerCase()}</strong>
                  </Link>
                </h3>
                {showFollowBtn && (

                  <diV>
                    <button className={styles.followButton} onClick={onFollowClick}>
                      {userFollowLoading ? (
                        <Spinner />
                      ) : userDetails?.requesting_user_follows ? (
                        "Unfollow"
                      ) : (
                        "+ Follow"
                      )}
                    </button>
                  </diV>

                )}
              </div>
            </div>

          </div>
          <div className={styles.cardContent}>
            <div className={styles.cardExtras}>
              <div className={styles.cardSummary}>
                {userDetails?.organisation && (
                  <div className={styles.statItem}>
                    <span>
                      Organisation: {userDetails?.organisation}
                    </span>
                  </div>
                )}
                <div className={styles.statItem}>
                  <span>Joined {userDetails?.age}</span>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NewUserCard;
