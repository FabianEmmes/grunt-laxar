/*jshint quotmark:false,-W079*/
var require = { 
   "baseUrl": "bower_components", 
   "packages": [
      { 
         "name": "laxar-application", 
         "location": "..", 
         "main": "init"
      }
   ], 
   "paths": { 
      "json": "requirejs-plugins/src/json", 
      "text": "requirejs-plugins/lib/text", 
      "jjv": "jjv/lib/jjv", 
      "jjve": "jjve/jjve", 
      "laxar": "laxar/dist/laxar", 
      "laxar-uikit": "laxar-uikit/dist/laxar-uikit", 
      "angular": "angular/angular", 
      "angular-route": "angular-route/angular-route", 
      "angular-sanitize": "angular-sanitize/angular-sanitize", 
      "laxar-path-root": "..", 
      "laxar-path-layouts": "../application/layouts", 
      "laxar-path-pages": "../application/pages", 
      "laxar-path-controls": "../controls", 
      "laxar-path-widgets": "../widgets", 
      "laxar-path-themes": "../themes", 
      "laxar-path-default-theme": "laxar-uikit/dist/themes/default.theme", 
      "laxar-path-flow": "../application/flow/flow.json", 
      "test-lib": "../libs/test_lib/test"
   }, 
   "shim": { 
      "lodash": function ( _ ) {
         'use strict';
         _.noConflict();
         return _;
      }, 
      "angular-route": [
         "angular"
      ], 
      "angular-sanitize": [
         "angular"
      ]
   }, 
   "deps": [
      "es6-shim",
      "es7-shim"
   ], 
   "map": { 
      "widgets/default/local_widget": { 
         "angular": "new/and/improved/angular"
      }, 
      "widgets/default/test_widget": { 
         "angular": "even/better/angular", 
         "underscore": "lodash"
      }, 
      "widgets/default/test_widget/local_dependency": { 
         "underscore": "even-lower-dash"
      }
   }
};
