const { DataBase } = require( "./DataBase" );
const ModelUtils = require( "./Models/utils" );
const VK_API = require( "./VkAPI/VK_API" );

module.exports = {
    DataBase,
    VK_API,
    Roles: ModelUtils.Roles,
    Lessons: ModelUtils.Lessons,
}