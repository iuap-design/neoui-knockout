var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var Promise = require('promise');
var git = require('git-rev');
var file = require('html-wiring');
var inquirer = require('inquirer');
var spawn = require('cross-spawn');
var colors = require('colors/safe');
var rimraf = require('rimraf');
var childProcess = require('child_process');
var path = require('path');
var folder = require('yargs').argv.folder;
var browserSync = require('browser-sync');
var reload = browserSync.reload;

// var autoprefix = new LessPluginAutoPrefix({
//   browsers: ['last 2 versions', 'not ie < 8'],
// });


var pkg = JSON.parse(file.readFileAsString('package.json'));

function versionCompare(a, b) {
  var aArr = a.split('.');
  var bArr = b.split('.');
  var larger = false;
  var i;
  for (i = 0; i < 3; i++) {
    if (parseInt(aArr[i], 10) !== parseInt(bArr[i], 10)) {
      larger = parseInt(aArr[i], 10) > parseInt(bArr[i], 10);
      break;
    }
  }
  return larger;
}

function getQuestions() {
  return new Promise(function (resolve) {
    git.branch(function (branch) {
      var defaultBranch = branch;
      var defaultNpm = 'npm';
      var questions = [
        {
          type: 'input',
          name: 'version',
          message: 'please enter the package version to publish (should be xx.xx.xx)',
          default: pkg.version,
          validate: function (input) {
            if (/\d+\.\d+\.\d+/.test(input)) {
              if (versionCompare(input, pkg.version)) {
                return true;
              }
              return 'the version you entered should be larger than now';
            }
            return 'the version you entered is not valid';
          },
        },
        {
          type: 'input',
          name: 'branch',
          message: 'which branch you want to push',
          default: defaultBranch,
        },
        {
          type: 'input',
          name: 'npm',
          message: 'which npm you want to publish',
          default: defaultNpm,
          validate: function (input) {
            if (/npm/.test(input)) {
              return true;
            }
            return 'it seems not a valid npm';
          },
        },
      ];
      resolve(questions);
    });
  });
}



// colors.setTheme({
//   info: ['bold', 'green'],
// });

gulp.task('js_build', ['js_clean'], function (done) {
    gulp.src('./src/*.js')
        .pipe(concat('index.js'))
        .pipe(rename('neoui-knockout.js'))
        .pipe(gulp.dest('./dist'))
        .on('end', function () {
           done();
         });
});


gulp.task('js_uglify', ['js_build'], function (done) {
  gulp.src('./dist/neoui-knockout.js')
      .pipe(uglify({
        mangle: false,
      }))
      .pipe(rename('neoui-knockout.min.js'))
      .pipe(gulp.dest('./dist'))
      .on('end', function () {
        done();
      });
});


gulp.task('js_clean', function (done) {
  rimraf('./dist', {}, function () {
    done();
  });
});

gulp.task('move_toExam', function () {
    return gulp.src('./dist/neoui-knockout.js')
        .pipe(gulp.dest('./exmaples/' + folder + '/js'));
});


gulp.task('server', ['move_toExam'], function () {
    browserSync({
        server: {
            baseDir: "./exmaples/" + folder
        }
    });
    gulp.watch('src/' + folder + '/*.js', ['js_build']);
    gulp.watch('dist/*.js', ['move_toExam']);
    gulp.watch(['exmaples/js/*.js', 'exmaples/' + folder + '*.js', 'exmaples/' + folder + '*.html'], reload);
});

gulp.task('pub', ['js_uglify'], function () {
  getQuestions().then(function (questions) {
    inquirer.prompt(questions).then(function (answers) {
      pkg.version = answers.version;
      file.writeFileFromString(JSON.stringify(pkg, null, ' '), 'package.json');
      console.log(colors.info('#### Git Info ####'));
      spawn.sync('git', ['add', '.'], { stdio: 'inherit' });
      spawn.sync('git', ['commit', '-m', 'ver. ' + pkg.version], { stdio: 'inherit' });
      spawn.sync('git', ['push', 'origin', answers.branch], { stdio: 'inherit' });
      console.log(colors.info('#### Npm Info ####'));
      spawn.sync(answers.npm, ['publish'], { stdio: 'inherit' });
    }).catch(function (err) { console.log(err); });
  }).catch(function (err) { console.log(err); });
});



gulp.task('default', ['js_build']);
