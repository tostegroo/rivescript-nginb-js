module.exports = function(grunt)
{
    grunt.template.addDelimiters('handlebars-like-delimiters', '{{', '}}');

    var grunt_config =
    {
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            js: {
                files: ['./**/*.js'],
                tasks: ['jsdoc']
            }
        },

        jsdoc: {
            dist : {
                src: ['index.js', './config', './controllers/**/*.js', 'README.md'],
                options: {
                    destination : 'docs',
                       template : "node_modules/minami"
                }
            }
        },

        clean: ['./docs/*']
    };

    grunt.initConfig(grunt_config);

    //Grunt plugins
    grunt.loadNpmTasks('grunt-jsdoc');              // JSDoc
    grunt.loadNpmTasks('grunt-contrib-watch');      // Watch JS for live changes
    grunt.loadNpmTasks('grunt-contrib-clean');      // Clean up build files

    //Tasks
    grunt.registerTask('dev', ['clean', 'jsdoc' , 'watch']);
    grunt.registerTask('dist', ['clean', 'jsdoc']);
};
