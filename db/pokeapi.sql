\echo 'Delete and recreate pokeapi db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE pokeapi;
CREATE DATABASE pokeapi;
\connect pokeapi

\i pokeapi-schema.sql
\i pokeapi-seed.sql

\echo 'Delete and recreate pokeapi_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE pokeapi_test;
CREATE DATABASE pokeapi_test;
\connect pokeapi_test

\i pokeapi-schema.sql
\i pokeapi-seed.sql
