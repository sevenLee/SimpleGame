var GulpConfig = (function () {
    function gulpConfig() {  
        this.ALL_HTML_FILES = '*.html';
		this.ALL_JS_FILES = '*.js';
        this.ALL_CSS_FILES = '*.css';
        this.ALL_FILES = '/**/*';

        this.BROWSERSYNC_PORT = 8018;        

        this.source = './dist/';
        this.gameType = 'mobileDesktop';
        
        this.releaseFolder = '/release/';
        this.debugFolder = '/debug/';
        this.debugPath = this.source + this.debugFolder;
        this.releasePath = this.source + this.releaseFolder;
        this.htmlTemplate = './htmlTemplate/';
		this.libraryFolder = './libs';
		this.cssFolder = './css';
  
        this.mainJSFileName = 'main.js';

        this.mediafilesFolder = 'mediafiles/';
        this.finalFolder = 'final/';
        this.assetsFolder = 'assets/'; 
    }


    return gulpConfig;
})();
module.exports = GulpConfig;