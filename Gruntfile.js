module.exports = function(grunt) {
  var iwcConfigOverides={
        apiRootUrl:"https://www.owfgoss.org/ng/dev/mp/api",
  };
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
		connect: {
			app: {        
				options:{ 
					port: 8080,
                    base: ".", 
					keepalive: true,
					debug: true
				}
			}
		},
    copy: {
      mockapi: {
        files: [
          {
            src: ['api/**'],
            dest: './',
            cwd: 'bower_components/ozp-data-schemas/mock',
            expand: true,
            rename: function(dest, src) {
              return dest + src.replace(/index\.json$/, "index.html");
            }
          }
        ]
      },
      iwc: {
            src: ['**/*'],
            dest: 'iwc',
            expand: true,
            cwd: 'bower_components/ozp-iwc/dist',
            options: {
                process: function(content,srcPath) {
                    if(srcPath.match(/\.html/)) {
                        console.log("Filtering " + srcPath);
                        return content.replace(/ozpIwc\.(.*)=.*;/g,function(match,field) {
                            if(field in iwcConfigOverides) {
//                                console.log("   Setting " + field + " to " + iwcConfigOverides[field]);
                                return "ozpIwc."+field+'="'+iwcConfigOverides[field]+'";';
                            } else {
//                                console.log("   Ignoring " + match);
                                return match;
                            }
                        });
                    }
                    return content;
                }
            }
        
      },
      duplicate_api: {
        files: [
          {
            src: ['**'],
            dest: 'iwc/api',
            expand: true,
            cwd: 'api'
          }
        ]
      }
  },
  clean: {
    dist: ['api', 'iwc']
    }
  });

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
	
  // Default task(s).
  grunt.registerTask('default', ['connect']);

  grunt.registerTask('build', ['clean:dist', 'copy:iwc', 'copy:mockapi', 'copy:duplicate_api']);

};