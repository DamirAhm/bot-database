"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VK_API = exports.Lessons = exports.Roles = exports.DataBase = void 0;
var DataBase_1 = require("./DataBase");
Object.defineProperty(exports, "DataBase", { enumerable: true, get: function () { return DataBase_1.DataBase; } });
var utils_1 = require("./Models/utils");
Object.defineProperty(exports, "Roles", { enumerable: true, get: function () { return utils_1.Roles; } });
Object.defineProperty(exports, "Lessons", { enumerable: true, get: function () { return utils_1.Lessons; } });
var VK_API_1 = require("./VkAPI/VK_API");
Object.defineProperty(exports, "VK_API", { enumerable: true, get: function () { return __importDefault(VK_API_1).default; } });
