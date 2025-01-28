// SHOWING HOURS AGO
const tellAge = (utcTime) => {
  const SECOND_MILLIS = 1000;
  const MINUTE_MILLIS = 60 * SECOND_MILLIS;
  const HOUR_MILLIS = 60 * MINUTE_MILLIS;
  const DAY_MILLIS = 24 * HOUR_MILLIS;
  const MONTH_MILLIS = 30 * DAY_MILLIS;

  let time = new Date(utcTime);

  if (time < 1000000000000) {
    time *= 1000;
  }

  const now = new Date().getTime();
  const diff = now - time;

  if (time > now || time <= 0) {
    return null;
  }

  if (diff < 60 * SECOND_MILLIS) {
    return `${Math.trunc(diff / SECOND_MILLIS)} seconds ago`;
  }
  if (diff < 2 * MINUTE_MILLIS) {
    return "1 minute ago";
  }
  if (diff < 60 * MINUTE_MILLIS) {
    return `${Math.trunc(diff / MINUTE_MILLIS)} minutes ago`;
  }
  if (diff < 2 * HOUR_MILLIS) {
    return "1 hour ago";
  }
  if (diff < 24 * HOUR_MILLIS) {
    return `${Math.trunc(diff / HOUR_MILLIS)} hours ago`;
  }
  if (diff < 2 * DAY_MILLIS) {
    return "1 day ago";
  }
  if (diff < 6 * MONTH_MILLIS) {
    return `${Math.trunc(diff / DAY_MILLIS)} days ago`;
  }

  return `${Math.trunc(diff / MONTH_MILLIS)} months ago`;
};

export default tellAge;

export const getRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diff = now - date; // difference in milliseconds

  // Convert to seconds
  const seconds = Math.floor(diff / 1000);

  // Convert to minutes
  const minutes = Math.floor(seconds / 60);

  // Convert to hours
  const hours = Math.floor(minutes / 60);

  // Convert to days
  const days = Math.floor(hours / 24);

  // Convert to months
  const months = Math.floor(days / 30);

  // Convert to years
  const years = Math.floor(months / 12);

  if (years > 0) {
    return `${years} ${years === 1 ? "year" : "years"} ago`;
  } else if (months > 0) {
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  } else if (days > 0) {
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else {
    return `${seconds} ${seconds === 1 ? "second" : "seconds"} ago`;
  }
};
