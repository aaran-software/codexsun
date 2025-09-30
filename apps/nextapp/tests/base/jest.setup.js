// silence only dotenv logs
const originalLog = console.log;
console.log = (...args) => {
  if (args[0] && typeof args[0] === "string" && args[0].includes("[dotenv@")) {
    return;
  }
  originalLog(...args);
};
