/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
'use strict';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function condenseArraySchema( schema ) {
   // relevant standard section: 8.2
   // http://json-schema.org/latest/json-schema-validation.html#anchor128
   const condensed = {};
   let hasDefaultsInItems = false;

   if( Array.isArray( schema.items ) ) {
      const items = schema.items.map( function( s ) {
         const t = condenseJsonSchema( s, false );
         hasDefaultsInItems = hasDefaultsInItems || t !== null;
         return t === null ? {} : t;
      } );
      condensed.items = items;
   } else if( typeof schema.items === 'object' ) {
      const t = condenseJsonSchema( schema.items, false );
      if( t !== null ) {
         hasDefaultsInItems = true;
         condensed.items = t;
      }
   }

   if( typeof schema['additionalItems'] === 'object' ) {
      const subSchema = condenseJsonSchema( schema['additionalItems'], false );
      if( subSchema ) {
         condensed['additionalItems'] = subSchema;
      } else {
         if( !hasDefaultsInItems ) {
            return null;
         }
      }
   }

   return condensed;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function condenseObjectSchema( schema ) {
   // relevant standard section: 8.3
   // http://json-schema.org/latest/json-schema-validation.html#anchor134
   const condensed = {};

   if( schema.hasOwnProperty( 'properties' ) ) {
      condensed['properties'] = {};
      const props = schema['properties'];
      Object.keys( props ).forEach( function (propName) {
         const propThin = condenseJsonSchema( props[propName], true );
         if( propThin !== null ) {
            condensed['properties'][propName] = propThin;
         }
      } );
   }

   if( schema.hasOwnProperty( 'additionalProperties' ) ) {
      const additionalProperties = schema.additionalProperties;
      if( typeof additionalProperties === 'object' ) {
         const subSchema = condenseJsonSchema( additionalProperties );
         if( subSchema !== null ) {
            condensed['additionalProperties'] = subSchema;
         }
      }
   }

   if( schema.hasOwnProperty( 'patternProperties' ) ) {
      const patternProperties = schema.patternProperties;

      const newPatProps = {};
      let added = false;

      Object.keys( patternProperties ).forEach( function( pattern ) {
         const subSchema = condenseJsonSchema( patternProperties[pattern] );
         if( subSchema !== null ) {
            added = true;
            newPatProps[ pattern ] = subSchema;
         }
      } );

      if( added ) {
         condensed[ 'patternProperties' ] = newPatProps;
      }
   }

   return condensed;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const FORBIDDEN_PROPERTIES = ['additionalItems', 'definitions', 'dependencies', 'not',
      'allOf', 'anyOf', 'oneOf' ]

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @param {boolean} keepDefault   Should the default value of this schema be kept?
 *
 */
function condenseJsonSchema( schema, keepDefault ) {
   let condensed = null;

   if( schema['type'] === 'array' ) {
      condensed = condenseArraySchema( schema );
   } else if( schema['type'] === 'object' ) {
      condensed =  condenseObjectSchema( schema );
   }

   FORBIDDEN_PROPERTIES.forEach( function( propName ) {
      if( schema.hasOwnProperty( propName ) ) {
         throw 'JSON Schema property "' + propName + '" is not supported in condensed schemata.';
      }
   } );

   if( keepDefault && schema.hasOwnProperty( 'default' ) ) {
      if( condensed === null ) {
         condensed = {};
      }
      condensed['default'] = schema['default'];
   }

   if( condensed !== null ) {
      condensed['type'] = schema['type'];
   }

   return condensed;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Currently this implementation is only checked agains draft-04 of the json schema spec.
const ALLOWED_SCHEMATA_URLS = new Set( ['http://json-schema.org/draft-04/schema#'] );


//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Removes everything but default settings from a JSON Schema. I.e., for any data that is valid with respect
 * to the input schema is also valid with respect to the condensed schema. Additionally, all default values
 * that are set by the original schema are also set by the condensed schema.
 *
 * @param {JsonSchema} schema    Schema to be minimized. Will not be modified
 * @return {JsonSchema}          The minimized schema.
 * @throws {string}              If the schema could not be minimized, throw an error message.
 */
function condenseJsonSchemaRoot( schema ) {
   if( !schema.hasOwnProperty( '$schema' ) || !ALLOWED_SCHEMATA_URLS.has( schema['$schema'] ) ) {
      throw 'Incompatible schema or no schema declaration.';
   }
   const condensed = condenseJsonSchema( schema, false );
   condensed['$schema'] = schema['$schema'];
   return condensed;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = condenseJsonSchemaRoot;
