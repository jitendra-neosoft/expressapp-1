'use strict';

const express = require('express');
const router = express.Router();
const multer = require('multer');
const logger = require('../../utils/logger');
const fs = require('fs');
const dir = '././uploads';

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, dir);
  },
  filename: function (req, file, callback) {
    var fileExtension = file.originalname.split('.').pop();
    callback(null, 'file_' + Date.now() + '.' + fileExtension);
  }
})
var upload = multer({ storage: storage }).array('file',3);

router.post('/uploadImage', function (req, res) {
  upload(req, res, function (err) {
    if (err) {
      logger.error(err.stack);
      return res.status(500).send({ success: false, msg: 'Internal Server Error' });
    }
    else {
      let fileArray = [];
      try {
        let files = req.files;
        files.forEach(function (file) {
          fileArray.push({ 'fileId': file.filename })
        });
      }
      catch (e) {
        logger.error(e.stack);
        return res.status(500).send({ success: false, msg: 'Internal Server Error' });
      }
      return res.status(200).send({ success: true, msg: 'File is uploaded', data: fileArray });
    }
  });
});


router.get('/getImage/:fileId', function (req, res) {

  var file = req.params.fileId;
  if (!file) {
    return res.status(400).send('<p>Bad Request</p>');
  }
  fs.readFile(dir + '/' + file, function (err, content) {
    if (err) {
      logger.error(err.stack);
      if (err.code === 'ENOENT') {
        return res.status(404).send('<p>Not Found</P>')
      }
      return res.status(500).send('<p>Internal Server Error</P>');
    }
    else {
      res.writeHead(200, { 'Content-Type': 'image/jpg' });
      res.end(content, 'binary');
      return;
    }
  });
});

module.exports = router;