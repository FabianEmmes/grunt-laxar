/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/*jshint node: true*/
module.exports = function( grunt ) {
   'use strict';

   var _ = grunt.util._;
   var path = require( 'path' );
   var q = require( 'q' );
   var async = require( 'async' );

   // Injected into the WidgetCollector, this uses grunt to read the file
   // and returns the expected { data: }-object
   function httpClient() {
      return {
         get: function( url ) {
            var deferred = q.defer();

            grunt.verbose.writeln( 'Portal Angular dependencies: reading "' + url + '"' );

            setTimeout( function() {
               var data = grunt.file.readJSON( url );
               deferred.resolve( { data: data } );
            }, 0 );

            return deferred.promise;
         }
      };
   }

   function generateBootstrapCode( dependencies ) {
      var requireString = '[\n   \'' + dependencies.join( '\',\n   \'' ) + '\'\n]';

      return 'define( ' + requireString + ', function() {\n' +
         '   \'use strict\';\n' +
         '\n' +
         '   return [].map.call( arguments, function( module ) { return module.name; } );\n' +
         '} );\n';
   }

   grunt.registerMultiTask( 'portal_angular_dependencies',
      'Generate a requirejs configuration to bootstrap Angular.',
      function() {

         var options = this.options( {
            base: '.',
            laxar: 'laxar',
            pages: 'laxar-path-pages',
            widgets: 'laxar-path-widgets',
            requireConfig: 'require_config.js'
         } );
         var files = this.files;
         var done = this.async();

         var config = require( '../lib/require_config' )( options.requireConfig, options );
         var paths = require( '../lib/laxar_paths' )( config, options );

         grunt.verbose.writeln( 'Portal Angular dependencies: loading widget collector' );
         var widgetCollector = require( '../lib/widget_collector' )( config, options );

         grunt.verbose.writeln( 'Portal Angular dependencies: initializing widget collector' );
         widgetCollector.init( q, httpClient(), path.relative( config.baseUrl, paths.WIDGETS ) );

         async.each( files, function( file, done ) {
            var promises = [];
            var dependencies = {};

            grunt.verbose.writeln( 'Portal Angular dependencies: ' + file.dest );

            file.src.forEach( function( flow ) {
               var promise = widgetCollector.gatherWidgetsAndControls( paths.PAGES, paths.WIDGETS, flow );
               promises.push( promise.then( function( result ) {
                  _.merge( dependencies, result );
               } ) );
            } );

            q.all( promises ).then( function() {
               grunt.file.write( file.dest, generateBootstrapCode( dependencies.requires ) );
               grunt.log.ok( 'Created Angular dependencies in "' + file.dest + '".' );
               done();
            } ).catch( grunt.fail.fatal )
         }, done );
      } );
};
