module.exports = function(grunt)
{
	grunt.template.addDelimiters('handlebars-like-delimiters', '{{', '}}');

	var grunt_config =
	{
		pkg: grunt.file.readJSON('package.json'),

		watch: {
			js: {
				files: ['./controllers/*.js', './utils/*.js', './models/*.js', './template-files/*.js', './config/*.js'],
				tasks: ['jsdoc']
			}
		},

		jsdoc: {
			dist : {
				src: ['index.js', './config', './controllers/**/*.js', 'README.md'],
				options: {
					destination : 'docs',
					template : "node_modules/toast-jsdoc"
				}
			}
		},

		nsp: {
			package: grunt.file.readJSON('package.json')
		},

		eslint: {
			options: {
				configFile: './.eslintrc',
				//quiet: true
			},
			target: [
				'./*.js',
				'./config/*.js',
				'./controllers/*.js',
				'./models/*.js',
				'./template-files/*.js',
				'./utils/*.js'
			]
		},

		publish: {
			main: {
				src: ['./index.js'],
				options: {
					ignore: ['node_modules', 'docs', 'template-files']
				}
			}
		},

		clean: ['./docs/*']
	};

	grunt.initConfig(grunt_config);

	//Grunt plugins
	grunt.loadNpmTasks('grunt-jsdoc');					// JSDoc
	grunt.loadNpmTasks('grunt-contrib-watch');	// Watch JS for live changes
	grunt.loadNpmTasks('grunt-contrib-clean');	// Clean up build files
	grunt.loadNpmTasks('grunt-nsp');						// Security Check
	grunt.loadNpmTasks('grunt-eslint');					// Eslint
	grunt.loadNpmTasks('grunt-publish');				// Npm publish		

	//Tasks
	grunt.registerTask('dev', ['clean', 'jsdoc' , 'watch']);
	grunt.registerTask('check', ['nsp']);
	grunt.registerTask('test', ['eslint', 'nsp']);
	grunt.registerTask('dist', ['clean', 'jsdoc']);
	grunt.registerTask('publish', ['publish']);
};
