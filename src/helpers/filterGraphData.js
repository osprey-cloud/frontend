export const filterGraphData = (graphData, period) => {
  // Get the latest year from the graphDataArray
  let latestYear = graphData[graphData?.length - 1]?.Year;

  // Define the period of months you want to filter for (3, 4, or 6 etc)
  let periodMonths = period;

  // Calculate the start and end index for the period
  let endIndex = graphData?.findIndex((data) => data.Year === latestYear);

  // this value caters for months for latest year that are not in the period
  let numberOfMonthsInLatestYear = graphData?.filter(
    (record) => record.Year === latestYear
  )?.length;

  let startIndex = endIndex - periodMonths + numberOfMonthsInLatestYear;

  // Use the slice() method to extract the period of data from the graphData
  let filteredData = graphData?.slice(
    startIndex,
    endIndex + numberOfMonthsInLatestYear
  );

  // return the filtered data
  return filteredData;
};
