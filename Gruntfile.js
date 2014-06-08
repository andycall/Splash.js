module.exports = function(grunt) {
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		watch: {
			js : {
				files : [
					'src/src.js',
					"Gruntfile.js"
				],
				tasks : ['jshint']
			}
		},
		jshint : {
			options : {
				jshintrc : '.jshintrc'
			},
			all : ['Gruntfile.js, src/*.js']
		},
		browser_sync : {
			files : {
				src : [
					'src/src.js',
					'index.html'
				]
			},
			options : {
				watchTask : true
			}
		}
	});


	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-browser-sync');

	grunt.registerTask('default', ['watch',"browser_sync"]);
}