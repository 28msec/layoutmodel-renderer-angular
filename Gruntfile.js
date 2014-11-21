module.exports = function (grunt) {
    'use strict';
    
    var config = {
        app: 'app',
        src: 'app/directive',
        dist: 'dist'
    };

    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);
    grunt.task.loadTasks('tasks');
    
    var LIVERELOAD_PORT = 35729;
    var lrSnippet = require('connect-livereload')({
        port: LIVERELOAD_PORT
    });
    var mountFolder = function (connect, dir) {
        return connect.static(require('path').resolve(dir));
    };
    var modRewrite = require('connect-modrewrite');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: config,
        watch: {
            less: {
                files:  ['<%= config.app %>/styles/{,*/}*.less','<%= config.app %>/directive/*.less'],
                tasks: ['less']
            },
            ngconstant: {
            	files:  ['<%= config.app %>/directive/*.html'],
            	tasks: ['ngconstant:tpl']
            },
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    '<%= config.app %>/**/*.html',
                    '<%= config.app %>/styles/*.css',
                    '<%= config.app %>/directive/*',
                    '{.tmp,<%= config.app %>}/**/*.js',
                    '<%= config.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },
        ngconstant: {
           options: {
        	 space: ' ',
        	 deps: false
           },
           tpl: {
        	name: 'layoutmodel',
        	dest: '<%= config.app %>/directive/layoutmodeltemplate.js',
            wrap: '/*jshint quotmark:double */\n"use strict";\n\n<%= __ngModule %>',
        	constants: {
        	  LayoutModelTpl: grunt.file.read(config.app + '/directive/layoutmodel.html').replace(/(\r\n|\n|\r)/gm,' '),
        	  FactDetailTpl: grunt.file.read(config.app + '/directive/factdetails.html').replace(/(\r\n|\n|\r)/gm,' ')
        	 }
           }
        },
        //Connect
        connect: {
            options: {
                port: 9000,
                hostname: '0.0.0.0'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            modRewrite([
                                '!\\.html|\\.xml|\\images|\\.js|\\.css|\\.png|\\.jpg|\\.woff|\\.ttf|\\.svg|\\.ico /index.html [L]'
                            ]),
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, config.app)
                        ];
                    }
                }
            },
            test: {
                options: {
                    keepalive: false,
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            modRewrite([
                                '!\\.html|\\.xml|\\images|\\.js|\\.css|\\.png|\\.jpg|\\.woff|\\.ttf|\\.svg|\\.ico /index.html [L]'
                            ]),
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, config.app)
                        ];
                    }
                }
            }
        },
        open: {
            server: {
                url: 'http://localhost:<%= connect.options.port %>'
            }
        },
        less: {
            dist: {
                options: {
                },
                files: {
                    '<%= config.app %>/styles/index.css': ['<%= config.app %>/styles/index.less']
                }
            }
        },
       
        clean: {
            pre: ['dist/', 'coverage/', 'out/'],
            post: []
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            src: ['Gruntfile.js', '<%= config.app %>/modules/**/*.js', '<%= config.app %>/report/**/*.js', '<%= config.app %>/reports/**/*.js', 'tasks/**/*.js', 'tests/**/*.js','<%= config.app %>/directive/*.js'],
        },
        karma: {
            options: {
                configFile: './karma.conf.js'
            },
            dev: {
                browsers: ['Chrome'],
                autoWatch: true,
                singleRun: false
            },
            '1.2.9': {
                options: {
                    files: [
                        '<%= config.app %>/bower_components/angular/angular.js',
                        '<%= config.app %>/bower_components/angular-mocks-1.2.9/angular-mocks.js',                      
                        'tests/unit/karma.start.js',
                        'tests/unit/*.js'
                    ]
                }
            }
        },
        coveralls: {
            options: {
                'coverage_dir': 'coverage'
            }
        },
        protractor: {
            travis: 'tests/e2e/config/protractor-travis-conf.js',
            local: 'tests/e2e/config/protractor-conf.js'
        },
        jsonlint: {
            all: {
                src: ['package.json', 'swagger/*']
            }
        },
        // Add vendor prefixed styles
        autoprefixer: {
          options: {
            browsers: ['last 1 version']
          },
          dist: {
            files: [{
              expand: true,
              cwd: '.tmp/styles/',
              src: '{,*/}*.css',
              dest: '.tmp/styles/'
            }]
          }
        },

        // Automatically inject Bower components into the app
        'bower-install': {
          app: {
            html: '<%= config.app %>/index.html',
            ignorePath: '<%= config.app %>/'
          }
        },





        // Renames files for browser caching purposes
        rev: {
          dist: {
            files: {
              src: [
                '<%= config.dist %>/scripts/{,*/}*.js',
                '<%= config.dist %>/styles/{,*/}*.css',
                '<%= config.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                '<%= config.dist %>/styles/fonts/*'
              ]
            }
          }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
          html: '<%= config.app %>/index.html',
          options: {
            dest: '<%= config.dist %>'
          }
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
          html: ['<%= config.dist %>/{,*/}*.html'],
          css: ['<%= config.dist %>/styles/{,*/}*.css'],
          options: {
            assetsDirs: ['<%= config.dist %>']
          }
        },

        // The following *-min tasks produce minified files in the dist folder
        imagemin: {
          dist: {
            files: [{
              expand: true,
              cwd: '<%= config.app %>/images',
              src: '{,*/}*.{png,jpg,jpeg,gif}',
              dest: '<%= config.dist %>/images'
            }]
          }
        },
        svgmin: {
          dist: {
            files: [{
              expand: true,
              cwd: '<%= config.app %>/images',
              src: '{,*/}*.svg',
              dest: '<%= config.dist %>/images'
            }]
          }
        },
        htmlmin: {
          dist: {
            options: {
              collapseWhitespace: true,
              collapseBooleanAttributes: true,
              removeCommentsFromCDATA: true,
              removeOptionalTags: true
            },
            files: [{
              expand: true,
              cwd: '<%= config.dist %>',
              src: ['*.html', 'views/{,*/}*.html'],
              dest: '<%= config.dist %>'
            }]
          }
        },

        // Allow the use of non-minsafe AngularJS files. Automatically makes it
        // minsafe compatible so Uglify does not destroy the ng references
        ngmin: {
          dist: {
            files: [{
              expand: true,
              cwd: '.tmp/concat/scripts',
              src: '*.js',
              dest: '.tmp/concat/scripts'
            }]
          }
        },

        // Replace Google CDN references
        cdnify: {
          dist: {
            html: ['<%= config.dist %>/*.html']
          }
        },

        // Copies remaining files to places other tasks can use
        copy: {
          dist: {
            files: [{
              expand: true,
              dot: true,
              cwd: '<%= config.app %>',
              dest: '<%= config.dist %>',
              src: [
                '*.{ico,png,txt}',
                '.htaccess',
                '*.html',
                'views/{,*/}*.html',
                'bower_components/**/*',
                'images/{,*/}*.{webp}',
                'fonts/*',
                'directive/*.html'
              ]
            },
            {
                expand: true,
                cwd: 'app/bower_components/font-awesome/fonts',
                dest: 'dist/fonts',
                src: ['*']
            },
            {
              expand: true,
              cwd: '.tmp/images',
              dest: '<%= config.dist %>/images',
              src: ['generated/*']
            }]
          },
          styles: {
            expand: true,
            cwd: '<%= config.app %>/styles',
            dest: '.tmp/styles/',
            src: '{,*/}*.css'
          }
        },
        
        s3: {
            options: {
                access: 'public-read',
                maxOperations: 5,
                gzip: true,
                gzipExclude: ['.jpg', '.jpeg', '.png', '.xml', '.json', '.pdf', '.txt', '.ico']
            },
            prod: {
                bucket: 'rendering.secxbrl.info',
                upload: [{
                    src: 'dist/**/*',
                    dest: '',
                    rel: 'dist/',
                }]
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
          server: [
            'copy:styles'
          ],
          test: [
            'copy:styles'
          ],
          dist: [
            'copy:styles',
            'imagemin',
            'svgmin'
          ]
        }
    });

    grunt.registerTask('e2e', function(){
        var target = process.env.TRAVIS_JOB_NUMBER ? 'travis' : 'local';
        grunt.task.run([
            'webdriver',
            'connect:test',
            'protractor:' + target
        ]); 
    });

    grunt.registerTask('server', function (target) {
        if(target === 'dist'){
            return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
        }

        grunt.task.run([                     
            'less',
            'ngconstant:tpl',
            'connect:livereload',
            'open',
            'watch'
        ]);
    });
    
    grunt.registerTask('deploy', function() {
        if(process.env.TRAVIS_BRANCH === 'master' && process.env.TRAVIS_PULL_REQUEST === 'false') {
            grunt.task.run(['s3:prod']);
        }
    });

    grunt.registerTask('unit-tests', ['clean:pre', 'less', /* 'karma:1.2.9', */ 'clean:post']);
    grunt.registerTask('test', ['clean:pre', 'less', /* 'karma:1.2.9', */ 'clean:post' /*, 'e2e' */ ]);
    grunt.registerTask('build', ['clean:pre', 'bower-install','ngconstant:tpl','useminPrepare','concurrent:dist','autoprefixer','concat','ngmin',
                                 'copy:dist','cdnify','cssmin','uglify','rev','usemin','htmlmin']);
    grunt.registerTask('default', ['jsonlint', 'jshint', 'build', 'test', 'deploy']);
};
