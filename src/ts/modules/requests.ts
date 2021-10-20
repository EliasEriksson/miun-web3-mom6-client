import {apiURL, ContentType, GetResponse, RequestMethods} from "./constants.js";

/**
 * request file from the template directory.
 *
 * this template will be used with the render function in xrender.ts
 *
 * @param templateName: filename of the template.
 */
export const requestTemplate = async (templateName: string) => {
    let response = await fetch(`./templates/${templateName}`);
    return  await response.text();
}

/**
 * a general function to preform GET / POST / PUT / DELETE request.
 *
 * necessary headers will be set as needed.
 *
 * @param endpoint: the api endpoint to request
 * @param token: the authentication token. required for POST / PUT / DELETE.
 * @param method: the request method.
 * @param data: general data to be sent with the request.
 */
export const requestEndpoint = async <T>(
    endpoint: string,
    token: string|null = null,
    method: RequestMethods = "GET",
    data: {[key: string|number]: any}|undefined = undefined): Promise<[T, number]> => {
    let init: RequestInit = {
        method: method,
        headers: {
            "Content-Type": "application/json"
        }
    }
    if (token) {
        init.headers["Authorization"] = `Token ${token}`;
    }
    if (data) {
        init["body"] = JSON.stringify(data);
    }

    let response = await fetch(`${apiURL.href}${endpoint}`, init);
    if (method === "DELETE") {
        return [null, response.status];
    }
    return [await response.json(), response.status];
}
