// restaurants
import userBaseRestRequest from "./base/rest";

const restRequest = userBaseRestRequest();

export const RestaurantAPI = {

    async getAllName(token, cb) {
        await restRequest.get(`restaurants/name`, {}, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        }, token);
    },
    async exportExcel(token, cb) {
        await restRequest.get(`restaurants/export/excel`, {}, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        }, token, 'blob');
    },
    async importExcel(token, payload, cb) {
        const formData = new FormData();
        formData.append("file", payload.file);
        await restRequest.post(`restaurants/import/excel`, formData, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        }, token, true);
    },
    async getAll(token, { pageNumber, keyword }, cb) {
        const queryParams = new URLSearchParams();
        if (pageNumber) queryParams.append("pageNumber", pageNumber);
        if (keyword) queryParams.append("keyword", keyword);
        const queryString = queryParams ? `?${queryParams}` : "";
        await restRequest.get(`restaurants/all${queryString}`, {}, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        }, token);

    },
    async deleteRestaurant(token, id, cb) {
        await restRequest.delete(`restaurants/${id}`, {}, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        }, token);
    },
    async createRestaurant(token, payload, cb) {
        const formData = new FormData();
        for (const key in payload) {
            if (payload[key]) {
                if (key === "image" || key === "thumb") {
                    formData.append(key, payload[key]); // là File
                } else {
                    formData.append(key, payload[key]);
                }
            }
        }
        await restRequest.post(`restaurants`, formData, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        }, token, true);
    },
    async updateRestaurant(token, id, payload, cb) {
        const formData = new FormData();
        for (const key in payload) {
            if (payload[key]) {
                if (key === "image" || key === "thumb") {
                    formData.append(key, payload[key]); // là File
                } else {
                    formData.append(key, payload[key]);
                }
            }
        }
        await restRequest.put(`restaurants/${id}`, formData, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        }, token, true);
    },
    async getChart(token, cb) {
        await restRequest.get(`restaurants/chart`, {}, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        }, token);
    },
}