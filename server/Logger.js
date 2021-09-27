const { LoggingWinston: GCPLogger } = require("@google-cloud/logging-winston");
const GCPLogging = new GCPLogger();
const winston = require("winston");
let logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});
if (process.env.NODE_ENV === "production") {
  logger = winston.createLogger({
    transports: [
      new winston.transports.Console(),
      GCPLogging,
      // new winston.transports.Http({})
      new winston.transports.File({ filename: "combined.log" }),
    ],
  });
}
module.exports = logger;
