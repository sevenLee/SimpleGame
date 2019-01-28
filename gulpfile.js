var gulp        	= require( 'gulp'),
    uglify      	= require( 'gulp-uglify'),
    rename      	= require( 'gulp-rename'),
    tslint     	 	= require( 'gulp-tslint'),
    GulpConfig      = require( './gulp.config');
	gutil 			= require( 'gutil');
	source 			= require( 'vinyl-source-stream');
	browserify 		= require( 'browserify');
	vinylBuffer 	= require( 'vinyl-buffer');
	tsify 			= require( 'tsify');
    watchify 		= require( 'watchify');
    typedoc         = require( 'gulp-typedoc');
    runSequence     = require( 'run-sequence');
    gulpif          = require( 'gulp-if');
    browserSync     = require( 'browser-sync' ).create();
    notify          = require( 'gulp-notify' );
	sourcemaps      = require('gulp-sourcemaps');
	del 			= require('del');



var config 			= new GulpConfig();
var release         = false;

gulp.task('watch', function() {
    var watchedBrowserify = watchify( browserify( { 
                                            basedir: '.',
                                            debug: !release,
                                            entries: [ 'game/src/Main.ts'  ],
                                            cache: {},
                                            packageCache: {}
                                    } ).plugin( tsify, { target: 'es5' } )
                             );

    watchedBrowserify.on( 'update', rebuild );
    watchedBrowserify.on( 'log', gutil.log );

    function rebuild() {
       return watchedBrowserify.bundle()
                        .pipe( source( config.mainJSFileName ) )
                        .on("error", function(err) {
                            gutil.log("Browserify error:", err);
                        })
                        .pipe(vinylBuffer())
                        .pipe(sourcemaps.init({loadMaps: true})) 
                        .pipe(sourcemaps.write('./')) // writes .map file
                        .pipe( gulp.dest( config.debugPath  + '/js' ) )
                        .pipe(browserSync.reload( {stream:true} ))
                        .pipe(notify("Browser reloaded after watchify update!"));
    }
                    
    return rebuild();
});

gulp.task('serve', function() {
    browserSync.init({
        open: false,
        server: {
            baseDir: ( release ? config.releasePath : config.debugPath ) 
        },
        port: config.BROWSERSYNC_PORT
    });
});


gulp.task( 'browserify', function() {
    return browserify( { 
                        basedir: '.',
                        debug: !release,
                        entries: [ 'game/src/Main.ts'  ],
                        cache: {},
                        packageCache: {}
                    } ).plugin( tsify, { target: 'es5' } )
                    .bundle()
                    .pipe( source( config.mainJSFileName ) )
                    .pipe( gulpif( release, vinylBuffer() ) ) 
                    .pipe( gulpif( release, uglify() ) )
                    .pipe( gulpif( release, rename( function ( path ) { path.extname = '.min.js'; } ) ) )
                    .pipe( gulp.dest(  ( release ? config.releasePath : config.debugPath ) + '/js')  );
});

gulp.task( 'typedoc', function() {
    return gulp
        .src(['slotngf/corengf/src/'] )
        .pipe(typedoc({
            module: 'commonjs',
            target: 'es5',
            includeDeclarations: false,
            mode : 'file',
            out: 'slotngf/corengf/docs/',
            ignoreCompilerErrors: true,
            version: true,
            name : 'Next Generation Framework Core',
            hideGenerator: true,
        }))
    ;
});

gulp.task( 'html-copy', function( ) { 
     return gulp.src([config.htmlTemplate + config.gameType + ( release ? config.releaseFolder : config.debugFolder )  + '**/*'] )
                    .pipe( gulp.dest( ( release ? config.releasePath : config.debugPath ) ));
});

gulp.task( 'assets-copy', function(){
    return gulp.src( 
                [ config.mediafilesFolder + config.finalFolder + config.ALL_FILES ] 
            ) .pipe( 
                gulp.dest( config.source + ( release ? config.releaseFolder : config.debugFolder ) 
                                + config.assetsFolder ) 
            );
});

gulp.task( 'assets-copy-ngui', function(){
    return gulp.src( 
                [ 'ngui/' + config.mediafilesFolder + config.finalFolder + config.ALL_FILES ] 
            ) .pipe( 
                gulp.dest( config.source + ( release ? config.releaseFolder : config.debugFolder ) 
                                + config.assetsFolder ) 
            );
});

gulp.task( 'assets-copy-genplus', function(){
	return gulp.src(
		[ 'genplus/' + config.mediafilesFolder + config.finalFolder + config.ALL_FILES ]
	) .pipe(
		gulp.dest( config.source + ( release ? config.releaseFolder : config.debugFolder )
			+ config.assetsFolder )
	);
});

gulp.task( 'library-copy', function(){
      return gulp.src([config.libraryFolder + ( release ? config.releaseFolder : config.debugFolder ) + config.ALL_JS_FILES ] )
                    .pipe(gulp.dest( ( release ? config.releasePath : config.debugPath ) +  'js' ));
});

gulp.task( 'css-copy', function(){
      return gulp.src([config.cssFolder + '/' + config.ALL_CSS_FILES ] )
                    .pipe(gulp.dest( ( release ? config.releasePath : config.debugPath ) + 'css' ));
});

gulp.task( 'clear-dist-folder', function() {
	if( release ) {
		return del([
			config.releasePath,
		  ]);
	}
	return del([
		config.debugPath,
	  ]);
});

gulp.task( 'tslint', function () {
    return gulp.src(['**/*.ts', '!**/*.d.ts', '!node_modules/**'] )
      .pipe( tslint() )
      .pipe( tslint.report()) ;
});

gulp.task( 'configReleaseBuild', function () {
    release = true;
});

gulp.task( 'default', [ 'fast' ] );

gulp.task( 'fast', [ 'assets-copy', 'browserify' ] );

gulp.task( 'compile', [ 'html-copy', 'assets-copy', 'assets-copy-ngui', 'assets-copy-genplus', 'css-copy', 'library-copy', 'browserify' ] );

gulp.task( 'localServer',  ['serve', 'watch']);

gulp.task('release', function(  ) {
  runSequence( 'configReleaseBuild', 'clear-dist-folder', 'compile');
});

gulp.task('debug', function(  ) {
	runSequence( 'clear-dist-folder', 'compile');
});
