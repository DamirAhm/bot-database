const { DataBase } = require( "./DataBase" );
const ModelUtils = require( "./Models/utils" );

module.exports = {
    DataBase,
    Roles: ModelUtils.Roles,
    Lessons: ModelUtils.Lessons
}