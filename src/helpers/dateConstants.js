export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const today = new Date().getDate();
export const currentMonth = new Date().getMonth();
export const currentYear = new Date().getFullYear();

export const currentHour = new Date().getHours();
export const currentMinutes = new Date().getMinutes();

// function to change date to required format by backend
const changeToFormat = (theDate) =>
  theDate.getFullYear() +
  "-" +
  (theDate.getMonth() + 1) +
  "-" +
  theDate.getDate();

// Get the current date now
const mytoday = new Date();

// the current date as required for the api graph calls
export const currentDate = changeToFormat(mytoday);

// date from three months back
export const subMonths = (date, months) => {
  return date.setMonth(date.getMonth() - months);
};

export const monthFigure = (month) =>
  ("0" + new Date(subMonths(mytoday, month)).getMonth()).slice(-2);

export const getBackDate = month => {
  let getCurrentYear = new Date();
  let thisYear = getCurrentYear.getFullYear();
  let thisMonth = getCurrentYear.getMonth();

  thisYear = ((thisMonth - month) <= 0) ? thisYear - 1 : thisYear;
  let result = changeToFormat(new Date(thisYear, monthFigure(month), "01"))
  return result;
}

/* 
 - getFullYear() - 1 returns a date from one year ago
 - setDate(1) changes the date to the first of the month
 - this is because the backend only wants the first day
   then set the year to the result which is a UTC value
   then the last new date changes it to a easily readable format which we 
   convert to the backend required format */
export const oneYearBack = changeToFormat(
  new Date(
    new Date(new Date().setFullYear(new Date().getFullYear() - 1)).setDate(1)
  )
);

export const twoYearBack = changeToFormat(
  new Date(
    new Date(new Date().setFullYear(new Date().getFullYear() - 2)).setDate(1)
  )
);

export const DisplayDateTime = (date) => {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + '' + ampm;
    return (date.getMonth()+1) + "-" + date.getDate() + "-" + date.getFullYear() + "  " + strTime;
}

// words date format
export const dateInWords = (dateString)  =>{
  const months = monthNames

  const date = new Date(dateString);
  const day = date.getDate();
  const suffix = getSuffix(day);
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const weekday = getWeekday(date.getDay());

  return `${weekday}, ${day}${suffix} ${month}, ${year}`;
}

function getSuffix(day) {
  if (day >= 11 && day <= 13) {
    return "th";
  }
  switch (day % 10) {
    case 1:  return "st";
    case 2:  return "nd";
    case 3:  return "rd";
    default: return "th";
  }
}

function getWeekday(day) {
  const weekdays = dayNames
  return weekdays[day];
}
export const replicaSetOptions = [
  { id: 1, name: "1" },
  { id: 2, name: "2" },
  { id: 3, name: "3" },
  { id: 4, name: "4" },
];

export const getYearOptions=() =>{
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let year = currentYear; year >= 2020; year--) {
    years.push({ name: year.toString(), value: year });
  }

  return years;
}