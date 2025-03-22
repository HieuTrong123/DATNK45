import HTTP_METHOD from "../../common/emun/httpMethodEnum";
import { HEADER_CONFIG, SERVICE_URL } from "./config";

const userBaseRestRequest = () => {
    const baseURL = SERVICE_URL;

    const handleResponse = async (response, cb) => {
        if (response && (response.status === 200 || response.status === 201)) {
            const data = await response.json();
            cb(null, data);
        } else {
            const errorResult = await response.json();
            cb(errorResult);
        }
    };

    const handleError = async (error, cb) => {
        cb(error);
    };

    const fetchAsync = async (url, config, cb) => {
        try {
            const response = await fetch(url, config);
            await handleResponse(response, cb);
        } catch (error) {
            handleError(error, cb);
        }
    };

    const sendRequest = async (method, endpoint, data, cb, token = null) => {
        const config = {
            method,
            headers: {
                ...HEADER_CONFIG,
                ...(token && { Authorization: `Bearer ${token}` })
            },
        };
        if (method !== HTTP_METHOD.GET && data) {
            config.body = JSON.stringify(data);
        }
        await fetchAsync(`${baseURL}${endpoint}`, config, cb);
    };

    const get = async (endpoint, data, cb, token) =>
        await sendRequest(HTTP_METHOD.GET, endpoint, data, cb, token);
    const post = async (endpoint, data, cb, token) =>
        await sendRequest(HTTP_METHOD.POST, endpoint, data, cb, token);
    const put = async (endpoint, data, cb, token) =>
        await sendRequest(HTTP_METHOD.PUT, endpoint, data, cb, token);
    const del = async (endpoint, data, cb, token) =>
        await sendRequest(HTTP_METHOD.DELETE, endpoint, data, cb, token);

    return {
        get,
        post,
        put,
        delete: del,
    };
};

export default userBaseRestRequest;
