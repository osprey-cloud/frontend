export const createDatabasesPieChartData = (databaseCounts) => {
  const pieChartData = [
    { category: "MySQL", value: databaseCounts.mysql_db_count },
    { category: "PostgreSQL", value: databaseCounts.postgres_db_count },
  ];
  return pieChartData;
};
