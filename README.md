# sass-update-middleware

Call `sass --update src:dest` on request

## Usage

```
var connect = require('connect');
var externalSass = require('connect-external-sass');

connect(
  externalSass({
    src: __dirname + '/sass',
    dest: __dirname + '/css',
    sassPath: '/usr/local/bin/sass',
    includePaths: [
      __dirname + '/sass/bourbon',
      __dirname + '/sass/neat'
    ]
  })
);
```
