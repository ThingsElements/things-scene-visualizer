'use strict';
 
var gulp = require("gulp");
var license = require('gulp-header-license');
var fs = require('fs');
 
gulp.task('license', function () {
    gulp.src('./src/**/*.js')
            .pipe(license('/*\n * Copyright © HatioLab Inc. All rights reserved.\n */\n'))
            .pipe(gulp.dest('./src/'));
    gulp.src('./test/**/*.js')
            .pipe(license('/*\n * Copyright © HatioLab Inc. All rights reserved.\n */\n'))
            .pipe(gulp.dest('./test/'));
    gulp.src('./test/**/*.html')
            .pipe(license('<!--\n@license\nCopyright © HatioLab Inc. All rights reserved.\n-->'))
            .pipe(gulp.dest('./test/'));
    gulp.src('./demo/**/*.html')
            .pipe(license('<!--\n@license\nCopyright © HatioLab Inc. All rights reserved.\n-->'))
            .pipe(gulp.dest('./demo/'));
});
