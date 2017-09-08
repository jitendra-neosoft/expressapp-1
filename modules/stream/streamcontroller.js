'use strict';

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

router.get('/streamVideo', function (req, res) {

  var file = path.resolve(__dirname, '../../video/movie.mp4');
  var stat = fs.statSync(file);
  var total = stat.size;
  if (req.headers['range']) {
    var range = req.headers.range;
    var parts = range.replace(/bytes=/, "").split("-");
    var partialstart = parts[0];
    var partialend = parts[1];

    var start = parseInt(partialstart, 10);
    var end = partialend ? parseInt(partialend, 10) : total - 1;
    var chunksize = (end - start) + 1;
    console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);

    res.writeHead(206, {
      'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4'
    });

    var stream = fs.createReadStream(file, { start: start, end: end })
      .on("open", function() {
        stream.pipe(res);
      })
      .on("error", function (err) {
        res.end(err);
      });

  }
  else {
    console.log('ALL: ' + total);
    res.writeHead(200, {
      'Content-Length': total,
      'Content-Type': 'video/mp4'
    });

    var stream = fs.createReadStream(file, { start: start, end: end })
      .on("open", function() {
        stream.pipe(res);
      })
      .on("error", function (err) {
        res.end(err);
      });
  }

});

module.exports = router;