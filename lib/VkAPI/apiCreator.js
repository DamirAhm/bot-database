"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVkApi = void 0;
const tslib_1 = require("tslib");
const qs_1 = tslib_1.__importDefault(require("qs"));
const https_1 = tslib_1.__importDefault(require("https"));
const createVkApi = (token) => {
    return (method, pars) => {
        pars.v = pars.v || "5.103";
        return new Promise((resolve, reject) => {
            const params = qs_1.default.stringify(pars);
            https_1.default.get({
                host: "api.vk.com",
                path: `/method/${method}?${params}&access_token=${token}`
            }, (res) => {
                let resData = "";
                res.on("data", data => resData += data.toString());
                res.on("end", () => {
                    try {
                        const result = JSON.parse(resData);
                        if (result.error) {
                            reject(result.error);
                        }
                        else {
                            resolve(result.response);
                        }
                    }
                    catch (e) {
                        reject(e.message);
                    }
                });
            });
        });
    };
};
exports.createVkApi = createVkApi;
