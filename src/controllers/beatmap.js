const Beatmap = require('../models/beatmap');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const uniqid = require('uniqid');
const utils = require('../utils');

exports.index = (req, res) => {
  Beatmap.find({}, (err, beatmaps) => {
    if (err) {
      res.json({
        status: 'error',
        message: err,
      });
    } else {
    }
    res.json({
      status: 'success',
      message: 'beatmaps retrieved successfully',
      data: beatmaps
    });
  });
};

exports.getMusic = (req, res) => {
  Beatmap.findOne({orgID: req.params.org_id}, (err, beatmap) => {
    if (err || !beatmap) {
      res.json({
        status: 'fail',
        error: err
      });
    } else {
      let dir = path.join('data', 'beatmaps', 'raw', beatmap.orgID);
      const filePath = path.join(dir, beatmap.audioFilename);
      const stat = fs.statSync(filePath);
      res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': stat.size
      });
      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
    }
  });
}

exports.add = async (req, res) => {

  let extractDir = path.join('data', 'beatmaps', 'raw');
  const errors = [];
  const files = req.files;
  const beatmaps = [];
  let count = 0;
  for (let i = 0; i < files.length; i++) {
    const filename = files[i].originalname;
    const ID = filename.split(' ')[0];
    try {

      // Extract osz
      extractDir = path.join(extractDir, ID);
      if (!fs.existsSync(extractDir)) fs.mkdirSync(extractDir);
      const zip = new AdmZip(files[i].path);
      zip.extractAllTo(extractDir, true);

      // Read folder content
      const filenames = fs.readdirSync(extractDir);
      const difficulties = [];
      for (let j = 0; j < filenames.length; j++) {
        const filename = filenames[j];
        const ext = filename.split('.').pop();
        if (ext === 'osu') {
          const matches = filename.match(/\[(.*?)\]/g);
          const name = matches[0].replace(/\[/g, '').replace(/\]/g, '');
          difficulties.push({id: uniqid(), path: filename, name});
        }
      }

      const fullPath = path.join(extractDir, filename);
      const diffContent = fs.readFileSync(fullPath, {encoding:'utf8', flag:'r'});
      const data = utils.parseOSU(diffContent);
      console.log(data.Events);

      const beatmap = new Beatmap({
        orgID: ID,
        title: data.Metadata.Title,
        artist: data.Metadata.Artist,
        source: data.Metadata.Source,
        tags: data.Metadata.Tags,
        audioFilename: data.General.AudioFilename,
        backgroundFilename: data.Events[0][2],
        difficulties
      });

      //console.log(beatmap);
      beatmap.save((err) => {

        count++;
        if (err) {
          errors.push(err);
        } else {
          beatmaps.push(beatmap);
        }

        if (count === files.length) {
          if (errors.length > 0) {
            res.json({
              status: 'fail',
              errors
            });
          } else {
            res.json({
              status: 'success',
              data: beatmaps
            });
          }
        }

      });

    } catch (err) {
      errors.push(err);
    }
  }

};

exports.new = (req, res) => {
  const beatmap = new Beatmap(req.body);
  beatmap.save((err) => {
    if (err) {
      res.json(err);
    } else {
      res.json({
        status: 'success',
        message: 'New beatmap created!',
        data: beatmap
      });
    }
  });
}

exports.view = (req, res) => {
  Beatmap.findById(req.params.id, (err, beatmap) => {
    if (err) {
      res.send(err);
    }
    else {
      res.json({
        status: 'success',
        message: 'Beatmap retrieved successfully',
        data: beatmap
      });
    }
  });
};

exports.update = (req, res) => {

  Beatmap.findOne({_id: req.body._id}, (err, beatmap) => {
    if (err || !beatmap) {
      res.send({
        status: 'fail',
        error: err
      });
    } else {
      for(let key in req.body) {
        beatmap[key] = req.body[key];
      }
      beatmap.save((err) => {
        if (err) {
          res.send({
            status: 'fail',
            error: err
          });
        } else {
          res.json({
            status: 'success',
            message: 'beatmap Info updated',
            data: beatmap
          });
        }
      });
    }
  });
};

exports.delete = (req, res) => {
  Beatmap.deleteOne({
    _id: req.params.id
  }, (err) => {
    if (err) {
        res.send(err);
    } else {
      res.json({
        status: 'success',
        message: 'beatmap deleted'
      });
    }
  });
  /*Beatmap.deleteMany({}, (err) => {
    res.json({
      status: 'Success'
    })
  });*/
};



