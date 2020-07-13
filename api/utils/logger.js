const winston = require("winston/lib/winston/config");
const expressWinston = require('express-winston');
const ElasticsearchTransport = require('winston-elasticsearch');

const {
    createLogger,
    transports,
    format
} = require('winston');
require('winston-mongodb');
const moment = require('moment-timezone');

var d = new Date();
var stringDate = [d.getFullYear(),d.getMonth(),d.getDay()].join("");

const appendTimestamp = format((info, opts) => {
  if(opts.tz)
    // info.timestamp = moment().tz(opts.tz).format();
    info.timestamp = moment().add(7);
  return info;
});

const logger = createLogger({
    transports: [
        new transports.MongoDB({
            db: process.env.MONGO_ATLAS_URL,
            collection: "log-"+stringDate,
            options:{useUnifiedTopology: true},
            format: format.combine(appendTimestamp({ tz: 'Asia/Jakarta' }), format.json()),
            expireAfterSeconds:86400,
            metaKey: 'meta'
        }),
    ]
});

// const requestLog = expressWinston.logger({
//   transports: [
//     new transports.Console({
//       format: format.json({
//         space: 2
//       },
//       appendTimestamp({ tz:'Asia/Jakarta' })
//       )
//     }),
//     new transports.MongoDB({
//         db: process.env.MONGO_ATLAS_URL,
//         collection: "log-"+stringDate,
//         options:{useUnifiedTopology: true},
//         format: format.combine(format.timestamp().options = appendTimestamp({ tz: 'Asia/Jakarta' }), format.json()),
//         expireAfterSeconds:86400,
//         metaKey: 'meta'
//     }),
//     new ElasticsearchTransport.ElasticsearchTransport({
//       index: 'log-'+stringDate,
//       clientOpts: { node: "http://localhost:9200" },
//       transformer: { 
//         // timestamp: appendTimestamp({tz:'Asia/Jakarta'}),
//         meta: 'meta'
//       }
//     })
//   ],
//   meta: true,
//   msg: "Request: HTTP {{req.method}} {{req.url}}",
//   requestWhitelist: [
//     "url",
//     "method",
//     "httpVersion",
//     "originalUrl",
//     "query",
//     "body"
//   ],
//   responseWhitelist: [
//     "body"
//   ]
// });

const errorLog = expressWinston.errorLogger({
  transports: [
    new transports.MongoDB({
        db: process.env.MONGO_ATLAS_URL,
        collection: "log-"+stringDate,
        options:{useUnifiedTopology: true},
        format: format.combine(appendTimestamp({ tz: 'Asia/Jakarta' }), format.json()),
        expireAfterSeconds:86400,
        metaKey: 'meta'
    }),
]
});

exports.logger = logger;
// exports.requestLog = requestLog;
exports.errorLog = errorLog;