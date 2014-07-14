'use strict';
module.exports = function(grunt){
	grunt.initConfig({
		srcFolder: 'src/',
		nodewebkit: {
			options: {
				build_dir: './builds',
				mac_icns: './src/resource/icon512x512.icns',
				mac: true,
				win: true,
				linux32: false,
				linux64: false
			},
			src: ['./src/**/*']
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'<%= srcFolder %>/app/scripts/*.js',
				'<%= srcFolder %>/app/scripts/*.js',
			]
		},
		csslint: {
			options: {
				csslintrc: '.csslintrc'
			},
			src: [
				'<%= srcFolder %>/app/assets/css/*.css'
			]
		},
		watch: {
			js: {
				files: [
					'<%= jshint.all %>'
				],
				tasks: ['jshint']
			},
			css: {
				files: [
					'<%= csshint.src %>',
				],
				tasks: ['csslint']
			}
		}
	});
	
	// Load required tasks
	require('load-grunt-tasks')(grunt);
	grunt.loadNpmTasks('grunt-newer');

	grunt.registerTask('dev', [
		'watch'
	]);

	grunt.registerTask(
		'default',
		'Build the Spock application',
		['jshint', 'csslint', 'nodewebkit']
	);
};