import {render} from "./modules/xrender.js";
import {requestEndpoint, requestTemplate} from "./modules/requests.js";
import {ContentType, Endpoint, GetResponse} from "./modules/constants.js";


const courseButtonElement = document.getElementById("courses");
const jobButtonElement = document.getElementById("jobs");
const websiteButtonElement = document.getElementById("websites");

const tableElement = document.getElementById("table");
const paginatorElement = document.getElementById("paginator");
const paginatorListElement = document.getElementById("paginator-list");

class Loader<T extends ContentType> {
    private readonly headingTemplate: string;
    private readonly dataTemplate: string;
    private readonly endpoint: string;

    private courseCount: number;
    private pageLimit: number;
    private pageOffset: number;

    constructor(endpoint: Endpoint, headingTemplate: string, dataTemplate: string) {
        this.headingTemplate = headingTemplate;
        this.dataTemplate = dataTemplate;
        this.endpoint = endpoint;

        this.courseCount = 0;
        this.pageLimit = 10;
        this.pageOffset = 0;
    }

    static create = async <T extends ContentType>(endpoint: Endpoint) => {
        let headingTemplateP = requestTemplate(`${endpoint}-heading.html`);
        let dataTemplateP = requestTemplate(`${endpoint}.html`);

        return new Loader<T>(endpoint, await headingTemplateP, await dataTemplateP);
    }

    getRequest = async (queryParams: string = "") => {
        tableElement.innerHTML = "";
        paginatorElement.style.display = "none";
        let [response, status] = await requestEndpoint<GetResponse<T>>(
            `${this.endpoint}/${queryParams}`
        );

        this.updatePageDetails(response);
        if (this.courseCount > this.pageLimit) {
            this.renderPaginator();
        }

        if (200 <= status && status < 300) {
            this.renderResponse(response.results);
        }
    }

    updatePageDetails = (response: GetResponse<T>) => {
        this.courseCount = response.count;
        if (response.next) {
            let nextURL = new URL(response.next);
            this.pageLimit = parseInt(nextURL.searchParams.get("limit"));
            // current offset must be 'limit' less than next
            this.pageOffset = parseInt(nextURL.searchParams.get("offset")) - this.pageLimit;
        } else if (response.previous) {
            let previousURL = new URL(response.previous);
            this.pageLimit = parseInt(previousURL.searchParams.get("limit"));
            // if a previous link exist the current offset is 'limit' more than that
            // if the previous link have no offset we are on the last page
            if (previousURL.searchParams.has("offset")) {
                this.pageOffset = parseInt(previousURL.searchParams.get("offset")) + this.pageLimit;
            } else {
                this.pageOffset = Math.floor(this.courseCount / this.pageLimit) * this.pageLimit;
            }
        }
    }

    renderPaginator = () => {
        paginatorListElement.innerHTML = "";
        paginatorElement.style.display = "flex";

        let pageCount = Math.ceil(this.courseCount / this.pageLimit);
        let currentPageNumber = this.pageOffset / this.pageLimit;

        const start = Math.max(0, currentPageNumber - 2);
        const end = Math.min(currentPageNumber + 3, pageCount);

        for (let pageNumber = start; pageNumber < end; pageNumber++) {
            let btn = document.createElement("button");
            let page = document.createElement("li");

            //if a page on the paginator i clicked a new get request is made.
            btn.addEventListener("click", async () => {
                await this.getRequest(
                    `?offset=${this.pageLimit * (pageNumber)}&limit=${this.pageLimit}`
                );
            });

            if (pageNumber === currentPageNumber) {
                btn.classList.add("current-page");
            }
            btn.innerHTML = `${pageNumber + 1}`;
            page.appendChild(btn);
            paginatorListElement.appendChild(page);
        }
    }

    renderResponse = (resultContent: T[]) => {
        tableElement.className = "";
        tableElement.classList.add("table");
        tableElement.classList.add(this.endpoint);
        tableElement.appendChild(render(
            this.headingTemplate, {}
        ));

        let spacer = document.createElement("div");
        spacer.classList.add("spacer");
        for (const content of resultContent) {
            if (content["endDate"] !== undefined && content["endDate"] === null) {
                content["endDate"] = "nuvarande";
            }
            tableElement.appendChild(spacer.cloneNode());
            tableElement.appendChild(render(
                this.dataTemplate, content
            ));
        }
    }
}


window.addEventListener("load", async () => {
    Loader.create(
        "courses",
    ).then(loader => {
        courseButtonElement.addEventListener("click", () => {
            loader.getRequest();
        });
    });

    Loader.create(
        "jobs",
    ).then(loader => {
        jobButtonElement.addEventListener("click", () => {
            loader.getRequest();
        });
    });

    Loader.create(
        "webpages",
    ).then(loader => {
        websiteButtonElement.addEventListener("click", () => {
            loader.getRequest();
        });
    });
});