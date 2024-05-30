export default (milliseconds: number) => {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);

  seconds = seconds % 60;
  minutes = minutes % 60;
  hours = hours % 24;

  let timeTaken = '';

  if (hours > 0) {
    timeTaken += `${hours} hours`;
  }

  if (minutes > 0) {
    timeTaken += `${timeTaken.length > 0 ? ', ' : ''}${minutes} minutes`;
  }

  if (seconds > 0) {
    timeTaken += `${timeTaken.length > 0 ? ', ' : ''}${seconds} seconds`;
  }

  console.log(timeTaken);
  return timeTaken;
};
