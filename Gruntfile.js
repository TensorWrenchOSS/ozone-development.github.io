module.exports = function(grunt) {

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
            dest: 'iwc/',
            cwd: 'bower_components/ozp-data-schemas/mock',
            expand: true,
            rename: function(dest, src) {
              return dest + src.replace(/index\.json$/, "index.html");
            }
          }
        ]
      },
      iwc: {
        files: [
          {
            src: ['**'],
            dest: 'iwc',
            expand: true,
            cwd: 'bower_components/ozp-iwc/dist'
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

  grunt.registerTask('build', ['clean:dist', 'copy:iwc', 'copy:mockapi']);

};