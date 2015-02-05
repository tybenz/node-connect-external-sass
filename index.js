var fs = require('fs');
var spawn = require('child_process').spawn;

module.exports = function externalSass( options ) {
    options = options || {};

    // sass command
    var sassPath = options.sassPath || '/usr/bin/sass';
    fs.exists( sassPath, function( exists ) {
        if ( !exists ) {
            throw new Error( 'sass command not exists' );
        }
    });

    return function( req, res, next ) {
        var path = req.url;

        // check ext
        if ( !path.match( /^\/css/ ) ) {
            return next();
        }

        // exec sass command
        var args = [ options.src + ':' + options.dest, '--update' ];
        options.includePaths.forEach( function( path ) {
            args.push( '-I' );
            args.push( path );
        });
        var sass = spawn( sassPath, args );

        sass.stderr.on( 'data', function( err ) {
            next( new Error( err ) );
        });

        sass.on( 'close', function( code ) {
            next();
        });
    };
};
