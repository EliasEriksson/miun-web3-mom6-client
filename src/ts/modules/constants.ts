export const apiURL = new URL("https://web3mom6rest.eliaseriksson.eu/");

export type Course = {
    id: number,
    university: string,
    name: string,
    credit: number,
    startDate: string,
    endDate: string,
    order: number
}

export type Job = {
    id: number,
    company: string,
    title: string,
    startDate: string,
    endDate: string,
    order: number
}

export type WebPage = {
    id: number,
    title: string,
    description: string,
    url: string,
    order: number
}

export type ContentType = Course|Job|WebPage;

export type GetResponse<T extends ContentType> = {
    count: number,
    next: string|null,
    previous: string|null,
    results: T[]
}

export type Endpoint = "courses" | "jobs" | "webpages";

export type RequestMethods = "GET" | "POST" | "PUT" | "DELETE";