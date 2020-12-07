import qs from "qs";
import https from "https";
export const createVkApi = (token) => {
    return (method, pars) => {
        pars.v = pars.v || "5.103";
        return new Promise((resolve, reject) => {
            const params = qs.stringify(pars);
            https.get({
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
