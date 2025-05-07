import userBaseRestRequest from "./base/rest";

const restRequest = userBaseRestRequest();

export const CategoryAPI = {
    async getAllName(token, cb) {
        await restRequest.get(`categories/name`, {}, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        }, token);
    },
    async exportExcel(token, cb) {
        await restRequest.get(`categories/export/excel`, {}, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        }, token, 'blob');
    },
    async importExcel(token, payload, cb) {
        const formData = new FormData();
        formData.append("file", payload.file);
        await restRequest.post(`categories/import/excel`, formData, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        }, token, true);
    },
    async getAllCategory(token, { pageNumber, keyword }, cb) {
        const queryParams = new URLSearchParams();
        if (pageNumber) queryParams.append("pageNumber", pageNumber);
        if (keyword) queryParams.append("keyword", keyword);
        const queryString = queryParams ? `?${queryParams}` : "";
        await restRequest.get(`categories//all${queryString}`, {}, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        }, token);
    },
    async deleteCategory(token, id, cb) {
        await restRequest.delete(`categories/${id}`, {}, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        }, token);
    },
    async createCategory(token, payload, cb) {
        const formData = new FormData();
        formData.append("name", payload.name);
        formData.append("image", payload.image);

        await restRequest.post(`categories`, formData, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        }, token, true);
    },
    async updateCategory(token, id, payload, cb) {
        const formData = new FormData();
        formData.append("name", payload.name);

        if (payload.image instanceof File) {
            formData.append("image", payload.image);
        }

        await restRequest.put(`categories/${id}`, formData, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        }, token, true);
    },
    async getChart(token, cb) {
        await restRequest.get(`categories/chart`, {}, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        }, token);
    },
}