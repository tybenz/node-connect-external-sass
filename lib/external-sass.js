var utils = require('connect').utils
  , fs = require('fs')
  , path = require('path')
  , join = path.join
  , normalize = path.normalize
  , spawn = require('child_process').spawn
  , mtime = {};

module.exports = function externalSass(root, options) {
  options = options || {};

  // root required
  if (!root) throw new Error('externalSass() root path required');
  root = path.normalize(root);

  // sass command
  var sassPath = options.sassPath || '/usr/bin/sass';
  fs.exists(sassPath, function(exists) {
    if (!exists) throw new Error('sass command not exists');
  });

  return function(req, res, next) {
    var path = req.url;

    // check ext
    if (!path.match(/\.css$/)) return next();

    // null byte(s)
    if (~path.indexOf('\0')) return utils.badRequest(res);

    // when root is not given, consider .. malicious
    if (!root && ~path.indexOf('..')) return utils.forbidden(res);

    // join / normalize from optional root dir
    if (options.prefix) {
      path = path.replace(new RegExp('^' + options.prefix), '');
    }
    var writePath = normalize(join(options.tmpDir, path));
    path = normalize(join(root, path)).replace(/\.css$/, '.scss');

    // malicious path
    if (root && 0 != path.indexOf(root)) return utils.forbidden(res);

    fs.stat(path, function(err, stat) {
      // ignore ENOENT
      if (err) return 'ENOENT' == err.code ? next() : next(err);

      // directory
      if (stat.isDirectory()) return next();

      // exec sass command
      var args = [path, writePath];
      options.includePaths.forEach( function( path ) {
          args.push( '-I' );
          args.push( path );
      });
      var sass = spawn(sassPath, args);

      // Set content type
      res.writeHead( 200, {
          'Content-Type': 'text/css'
      });

      sass.stdout.on('data', function(data) {
        var css = data.toString();
        mtime[path] = stat.mtime;
        res.write(css, function() {});
      });

      sass.stderr.on('data', function(err) {
        next(new Error(err));
      });

      sass.on('close', function(code) {
        res.end();
      });
    });
  }
};
