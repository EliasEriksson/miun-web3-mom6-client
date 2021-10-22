import {render} from "./modules/xrender.js";
import {requestEndpoint, requestTemplate} from "./modules/requests.js";
import {ContentType, Endpoint, GetResponse} from "./modules/constants.js";

// references to a few HTML elements
const courseButtonElement = document.getElementById("courses");
const jobButtonElement = document.getElementById("jobs");
const websiteButtonElement = document.getElementById("websites");

const tableElement = document.getElementById("table");
const paginatorElement = document.getElementById("paginator");
const paginatorListElement = document.getElementById("paginator-list");

/**
 * the loader class
 *
 * requests data and renders the data and the paginator to the DOM
 */
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

    /**
     * creates a loader with a specified endpoint
     *
     * @param endpoint:
     */
    static create = async <T extends ContentType>(endpoint: Endpoint) => {
        // initializes both downloads
        let headingTemplateP = requestTemplate(`${endpoint}-heading.html`);
        let dataTemplateP = requestTemplate(`${endpoint}.html`);

        // wait for both downloads to finish and return a new Loader object
        return new Loader<T>(endpoint, await headingTemplateP, await dataTemplateP);
    }

    /**
     * requests data from the endpoint and renders the data and a paginator
     *
     * queryParams is for internal use only. its used to page the REST service
     *
     * @param queryParams:
     */
    getRequest = async (queryParams: string = "") => {
        tableElement.innerHTML = "";
        paginatorElement.style.display = "none";
        let [response, status] = await requestEndpoint<GetResponse<T>>(
            `${this.endpoint}/${queryParams}`
        );

        if (200 <= status && status < 300) {
            this.updatePageDetails(response);

            // determines if the paginator is needed or not
            if (this.courseCount > this.pageLimit) {
                this.renderPaginator();
            }

            this.renderResponse(response.results);
        }
    }

    /**
     * updates courseCount, PageLimit and pageOffset with data from the response
     *
     * @param response
     */
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

    /**
     * render the paginator and adds it to the DOM
     */
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

    /**
     * renders the endpoints heading and data to the DOM
     *
     * any previous table is cleared first
     *
     * @param resultContent
     */
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
            // null endDate means current
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
    /**
     * initializes a loader for each endpoint
     */
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