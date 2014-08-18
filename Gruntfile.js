module.exports = function(grunt) {

  grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),

	concat: {
	  options: {
	    separator: ';'
	  },
	  dist: {
	    src: ['module/helper.js','module/util.js','module/model.js','module/build.webapp.js','module/controller.webapp.js'],
	    dest: 'dist/ak.js'
	  }
	},

	uglify: {
	  options: {
	    // the banner is inserted at the top of the output
	//     banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
	  },
	  dist: {
	    files: {
	      'dist/ak.min.js': ['<%= concat.dist.dest %>']
	    }
	  }
	},

	jshint: {
	  // define the files to lint
	  files: ['module/helper.js','module/util.js','module/model.js','module/build.webapp.js','module/controller.webapp.js'],
	  // configure JSHint (documented at http://www.jshint.com/docs/)
	  options: {
	      // more options here if you want to override JSHint defaults
	    globals: {
	      jQuery: true,
	      console: true,
	      module: true
	    }
	  }
	},

	cssmin: {
	  combine: {
	    files: {
	      'dist/ak.css': ['css/bootstrap.css', 'css/datepicker.css', 'css/fullcalendar.css', 'css/autoSuggest.css', 'css/style.css', 'css/zocial.css', 'css/bootstrap-responsive.css', 'css/dirtytext.css']
	    }
	  },
	  options: {
	    report: 'min'
	  }
	},
	
    imagemin: {
      dynamic: {
        files: [{
          expand: true,
          cwd: 'img/',
          src: ['**/*.{png,jpg,gif}'],
          dest: 'dist/img/'
        }]
      }
    }
/*
	,watch: {
		options: {
		  livereload: true,
		  livereload: 9090,
		},
		css: {
		  files: ['public/scss/*.scss'],
		  tasks: ['compass'],
		},
	}
	<script src="//localhost:35729/livereload.js"></script>
*/
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  //grunt.loadNpmTasks('grunt-html-build');
  //grunt.loadNpmTasks('grunt-contrib-watch');



  grunt.registerTask('img', ['imagemin']);
  grunt.registerTask('jshint', ['jshint']);
  grunt.registerTask('build', ['concat', 'uglify', 'cssmin']);
  //grunt.registerTask('watch', ['watch']);
  

  /*
  module.exports = function(grunt) {
  grunt.initConfig({
    concat: {
      'dist/all.js': ['src/*.js']
    },
    uglify: {
      'dist/all.min.js': ['dist/all.js']
    },
    jshint: {
      files: ['gruntfile.js', 'src/*.js']
    },
    watch: {
      files: ['gruntfile.js', 'src/*.js'],
      tasks: ['jshint', 'concat', 'uglify']
    }
  });


  // Load Our Plugins
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');


  // Register Default Task
  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
};
*/
};