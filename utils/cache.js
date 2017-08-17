'use strict';

const mcache = require('memory-cache');

module.exports.cache = function (duration) {
  return function (req, res, next) {
    let key = '__express__' + req.originalUrl || req.url
    let cachedBody = mcache.get(key)
    if (cachedBody) {
      res.send(JSON.parse(cachedBody))
      return
    } else {
      res.sendResponse = res.send
      res.send = function (body) {
        mcache.put(key, body, duration * 1000);
        res.sendResponse(body)
      }
      next()
    }
  }
}