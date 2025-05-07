import userBaseRestRequest from "./base/rest";

const restRequest = userBaseRestRequest();

export const PostAPI = {
    async GetAllPost({ pageNumber, keyword }, cb) {
        const queryParams = new URLSearchParams();
        if (pageNumber) queryParams.append("pageNumber", pageNumber);
        if (keyword) queryParams.append("keyword", keyword);

        const queryString = queryParams ? `?${queryParams}` : "";
        await restRequest.get(`post${queryString}`, {}, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        });
    },
    async searchPost({ pageNumber, keyword }, cb) {
        const queryParams = new URLSearchParams();
        if (pageNumber) queryParams.append("pageNumber", pageNumber);
        if (keyword) queryParams.append("keyword", keyword);

        const queryString = queryParams ? `?${queryParams}` : "";
        await restRequest.get(`post/search${queryString}`, {}, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        });
    },
    async GetSinglePost(PostId, cb) {
        await restRequest.get(`post/${PostId}`, {}, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        });
    },
    async Recomment(cb) {
        await restRequest.get(`post/recomment`, {}, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        });
    },
    async searchPost(q, page, cb) {
        const queryParams = new URLSearchParams();
        if (q) queryParams.append("q", q);
        if (page) queryParams.append("page", page);

        const queryString = queryParams ? `?${queryParams}` : "";
        await restRequest.get(`post/search${queryString}`, {}, (err, result) => {
            if (err) return cb(err);
            if (typeof cb === "function") cb(null, result);
        })
    }
};
