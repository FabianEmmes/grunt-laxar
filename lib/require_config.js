/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
var fs = require( 'fs' );
var path = require( 'path' );
var _ = require( 'lodash' );

/**
 * Load a configuration file for RequireJS and return
 * the config object.
 * If the configuration specifies paths for 'underscore' and/or
 * 'q', those will be replaced by local node modules.
 *
 * @param {String} file
 *    the config file
 * @param {Objecŧ} [options]
 *    additional options:
 *    - `base`: interpret the config file's `baseUrl` as
 *      relative to this directory
 *    - `globals`: export the given grobals the the require
 *      configuration script
 *
 * @return {Object}
 *    the configuration object
 */
module.exports = function requireConfig( file, options ) {
   'use strict';

   options = _.defaults( {
      paths: {
         jjv: require.resolve( 'jjv/lib/jjv' ).replace( /\.js$/, '' ),
         jjve: require.resolve( 'jjve' ).replace( /\.js$/, '' ),
         q: require.resolve( 'q' ).replace( /\.js$/, '' ),
         underscore: require.resolve( 'lodash' ).replace( /\.js$/, '' )
      }
   }, options, {
      base: '.',
      globals: {}
   } );

   var base = options.base;
   var globals = options.globals;
   var paths = options.paths;

   var template = fs.readFileSync( __dirname + '/require_config.tmpl' );
   var context = {
      globals: Object.keys( globals ),
      requireConfig: fs.readFileSync( path.resolve( file ) )
   };

   // Evaluate the given require configuration.
   // Trust me, JSHint, I know what I'm doing.
   /*jshint -W054*/
   var config = new Function( 'globals', _.template( template, context ) )( globals );

   var baseUrl = path.resolve( base || '.', config.baseUrl );

   config.baseUrl = baseUrl;
   config.deps = [];
   config.paths = config.paths || {};

   Object.keys( paths ).forEach( function( module ) {
      if( config.paths.hasOwnProperty( module ) ) {
         if( config.shim ) {
            delete config.shim[ module ];
         }
         config.paths[ module ] = paths[ module ];
      }
   } );

   // Replace application laxar with lib/laxar:
   console.log( 'REQUIRE config: ', JSON.stringify( config, null, 3 ) ); // :TODO: Delete
   var laxarPath = require.resolve( '../lib/laxar/laxar' ).replace( /\/laxar\.js$/, '' );
   console.log( 'REQUIRE laxar: ', laxarPath ); // :TODO: Delete
   delete config.paths.laxar;
   config.packages = ( config.packages || [] ).filter( function( _ ) { return _.name !== 'laxar'; } );
   config.packages.push( {
      name: 'laxar',
      location: laxarPath,
      main: 'laxar'
   } );

   return config;
};
