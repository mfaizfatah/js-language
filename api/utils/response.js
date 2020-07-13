const courier = require('./rabbitmq')
const log = require('./logger')

module.exports.success  = (res, status_code, data, msg="") => {
  const response    = {
    status: "success",
    error_message: msg,
    data: data
  }
  
  courier.sendLog(response)
  res.status(status_code).json(response)
}
  
module.exports.error  = (res, status_code, data, msg) => {
  const response    = {
    status: "error",
    error_message: msg,
    data: data
  }
  
    res.status(status_code).json(response)
}