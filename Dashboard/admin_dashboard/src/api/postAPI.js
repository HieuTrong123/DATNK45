import userBaseRestRequest from "./base/rest";

const restRequest = userBaseRestRequest();

export const PostAPI = {
    // async GetAllPost({ pageNumber, keyword }, cb) {
    //     const queryParams = new URLSearchParams();
    //     if (pageNumber) queryParams.append("pageNumber", pageNumber);
    //     if (keyword) queryParams.append("keyword", keyword);

    //     const queryString = queryParams ? `?${queryParams}` : "";
    //     await restRequest.get(`post${queryString}`, {}, (err, result) => {
    //         if (err) return cb(err);
    //         if (typeof cb === "function") cb(null, result);
    //     });
    // },

    async exportExcel(token, cb) {
        await restRequest.get(`post/export/excel`, {}, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        }, token, 'blob');
    },
    async importExcel(token, payload, cb) {
        const formData = new FormData();
        formData.append("file", payload.file);
        await restRequest.post(`post/import/excel`, formData, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        }, token, true);
    },

    async getAllPost(token, { pageNumber, keyword }, cb) {
        const queryParams = new URLSearchParams();
        if (pageNumber) queryParams.append("pageNumber", pageNumber);
        if (keyword) queryParams.append("keyword", keyword);
        const queryString = queryParams ? `?${queryParams}` : "";
        await restRequest.get(`post/all${queryString}`, {}, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        }, token);
    },
    async deletePost(token, id, cb) {
        await restRequest.delete(`post/${id}`, {}, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        }, token);
    },
    async createPost(token, payload, cb) {
        const formData = new FormData();
        for (const key in payload) {
            if (payload[key]) {
                if (payload[key] instanceof File) {
                    formData.append(key, payload[key]); // là ảnh
                } else {
                    formData.append(key, payload[key]); // là text
                }
            }
        }
        await restRequest.post(`post`, formData, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        }, token, true);
    },
    async updatePost(token, id, payload, cb) {
        const formData = new FormData();
        for (const key in payload) {
            if (payload[key]) {
                if (payload[key] instanceof File) {
                    formData.append(key, payload[key]); // là ảnh
                } else {
                    formData.append(key, payload[key]); // là text
                }
            }
        }

        await restRequest.put(`post/${id}`, formData, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        }, token, true);
    },
    async getChart(token, cb) {
        await restRequest.get(`post/chart`, {}, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        }, token);
    },
};
