import React, { useState } from "react";
import TagCard from "../TagCard";
import styles from "./TagList.module.css";
import Spinner from "../Spinner";
import PrimaryButton from "../PrimaryButton";
import TagsModal from "../TagsModal";
import { useTags } from "../../hooks/useTags";

const TagsList = (props) => {
  const [showModal, setShowModal] = useState(false);

  const { data: tags, isLoading: isLoadingTags } = useTags();
  const {title}=props;
  const handleViewMore = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className={styles.featuredProjects}>
      <h2>{title?? "Suggested Tags"}</h2>
      <div className={styles.grid}>
        {isLoadingTags ? (
          <div className={styles.noActivity}>
            <div className={styles.NoResourcesMessage}>
              <div className={styles.SpinnerWrapper}>
                <Spinner size="big" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {tags?.data?.data?.slice(0, 5).map((tag) => (
              <TagCard
                key={tag.id}
                name={tag.name}
                projects_count={tag.projects_count}
                isFollowing={tag.is_following}
                id={tag.id}
                isModalTag={false}
              />
            ))}
          </>
        )}

        {!isLoadingTags && (
          <PrimaryButton
            className={styles.viewMoreButton}
            onClick={handleViewMore}
          >
            View More
          </PrimaryButton>
        )}
        {showModal && (
          <TagsModal
            tags={tags?.data?.data}
            onClose={handleCloseModal}
            isModalTag={showModal}
          />
        )}
      </div>
    </div>
  );
};

export default TagsList;
