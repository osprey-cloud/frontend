export const calculateDuration = (startTime, endTime) => {
  const durationMs = endTime - startTime;

  const durationSeconds = Math.floor((durationMs / 1000) % 60);
  const durationMinutes = Math.floor((durationMs / (1000 * 60)) % 60);
  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));

  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }

  const durationParts = [];
  if (durationHours > 0) durationParts.push(`${durationHours}h`);
  if (durationMinutes > 0) durationParts.push(`${durationMinutes}m`);
  if (durationSeconds > 0) durationParts.push(`${durationSeconds}s`);

  return durationParts.join(" ");
};
