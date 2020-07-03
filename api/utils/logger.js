const winston = require("winston/lib/winston/config");
const expressWinston = require('express-winston');

const {
    createLogger,
    transports,
    format
} = require('winston');
require('winston-mongodb');

var d = new Date();
var stringDate = [d.getFullYear(),d.getMonth(),d.getDay()].join("");

const logger = createLogger({
    transports: [
        new transports.MongoDB({
            db: process.env.MONGO_ATLAS_URL,
            collection: "log-"+stringDate,
            options:{useUnifiedTopology: true},
            format: format.combine(format.timestamp(), format.json()),
            expireAfterSeconds:86400,
            metaKey: 'meta'
        }),
    ]
});

const requestLog = expressWinston.logger({
  transports: [
    // new transports.Console({
    //   format: format.json({
    //     space: 2
    //   })
    // }),
    new transports.MongoDB({
        db: process.env.MONGO_ATLAS_URL,
        collection: "log-"+stringDate,
        options:{useUnifiedTopology: true},
        format: format.combine(format.timestamp(), format.json()),
        expireAfterSeconds:86400,
        metaKey: 'meta'
    })
  ],
  meta: true,
  msg: "Request: HTTP {{req.method}} {{req.url}}",
  requestWhitelist: [
    "url",
    "method",
    "httpVersion",
    "originalUrl",
    "query",
    "body"
  ],
  responseWhitelist: [
    "body"
  ]
});

const errorLog = expressWinston.errorLogger({
  transports: [
    new transports.MongoDB({
        db: process.env.MONGO_ATLAS_URL,
        collection: "log-"+stringDate,
        options:{useUnifiedTopology: true},
        format: format.combine(format.timestamp(), format.json()),
        expireAfterSeconds:86400,
        metaKey: 'meta'
    }),
]
});

exports.logger = logger;
exports.requestLog = requestLog;
exports.errorLog = errorLog;