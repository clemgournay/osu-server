const Beatmap = require('../models/beatmap');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const uniqid = require('uniqid');
const utils = require('../utils');
const config = require('../config');

exports.index = (req, res) => {
  Beatmap.find({}, (err, beatmaps) => {
    if (err) {
      res.json({
        status: 'error',
        message: err,
      });
    } else {
      res.json({
        status: 'success',
        message: 'beatmaps retrieved successfully',
        data: beatmaps
      });
    }
  });
};

exports.getFile = (req, res) => {
  Beatmap.findOne({orgID: req.params.org_id}, (err, beatmap) => {
    if (err || !beatmap) {
      res.json({
        status: 'fail',
        error: err
      });
    } else {
      let dir = path.join(config.BEATMAP_DIR, 'raw', beatmap.orgID);
      const filePath = path.join(dir, req.params.filename);
      res.sendFile(path.resolve(filePath));
    }
  });
}

exports.getDiffData = (req, res) => {
  Beatmap.findOne({orgID: req.params.org_id}, (err, beatmap) => {
    if (err || !beatmap) {
      res.json({
        status: 'fail',
        error: err
      });
    } else {
      let dir = path.join(config.BEATMAP_DIR, 'raw', beatmap.orgID);
      const difficulty = this.getDifficulty(beatmap, req.params.diff_id);

      if (!difficulty) {
        res.json({
          status: 'fail',
          error: err
        });
      } else {
        const filePath = path.join(dir, difficulty.path);
        const content = fs.readFileSync(filePath, {encoding:'utf8'});
        
        res.json({
          status: 'success',
          data: content
        });
      } 
    }
  });
}

exports.add = async (req, res) => {

  const oszDir = path.join(config.BEATMAP_DIR, 'osz');
  utils.removeAllFilesInDir(oszDir);

  let extractDir = path.join(config.BEATMAP_DIR, 'raw');
  if (!fs.existsSync(extractDir)) fs.mkdirSync(extractDir);

  const errors = [];
  const files = req.files;
  const beatmaps = [];
  let count = 0;
  for (let i = 0; i < files.length; i++) {
    const filename = files[i].originalname;
    const ID = filename.split(' ')[0];
    try {

      // Extract osz
      const beatmapDir = path.join(extractDir, ID);
      if (!fs.existsSync(beatmapDir)) fs.mkdirSync(beatmapDir);

      const zip = new AdmZip(files[i].path);
      zip.extractAllTo(beatmapDir, true);

      // Read folder content
      const filenames = fs.readdirSync(beatmapDir);
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

      const fullPath = path.join(beatmapDir, difficulties[0].path);
      const diffContent = fs.readFileSync(fullPath, {encoding:'utf8'});
      const data = utils.parseOSU(diffContent);

      const beatmap = new Beatmap({
        orgID: ID,
        title: data.Metadata.Title,
        artist: data.Metadata.Artist,
        source: data.Metadata.Source,
        tags: data.Metadata.Tags,
        audioFilename: data.General.AudioFilename,
        backgroundFilename: data.Events[0][2].replace(/['"]+/g, ''),
        difficulties
      });

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

  Beatmap.findById(req.params.id, (err, beatmap) => {
    if (err || !beatmap) {
      res.json({
        status: 'fail',
        error: err
      });
    } else {

      const beatmapDir = path.join(config.BEATMAP_DIR, 'raw', beatmap.orgID);
      utils.removeAllFilesInDir(beatmapDir, () => {
        if (fs.existsSync(beatmapDir)) fs.rmdirSync(beatmapDir);
      });

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
    }
  });

  
};

exports.getDifficulty = (beatmap, diffID) => {
  let i = 0; let found = false;
  while (!found && i < beatmap.difficulties.length) {
    if (beatmap.difficulties[i].id === diffID) found = true;
    else i++;
  }
  return (found) ? beatmap.difficulties[i] : null;
}


