/**
 * typescript implementation of https://github.com/EliasEriksson/xRender/blob/main/static/js/xRender.js
 *
 * renders a htmlTemplate to HTML
 *
 * all keys in the object are used to replace the {{ variables }} in the template.
 * if a variable is found its replaced with the value for the key in context.
 *
 * if there are still {{ variables }} left in the template after the replacement
 * is done null is returned instead.
 *
 * @param template a HTML file with {{ variables }}
 * @param context originally a JSON object. Must have keys matching each {{ variable }} in the template
 * @returns ChildNode
 */
export function render(template: string, context: {[key: string]: any}): ChildNode|null {
    for (let variable in context) {
        template = template.replace(new RegExp(`{{\\s*${variable}\\s*}}`, "gm"), context[variable]);
    }
    if (template.match(/{{\s*[^}]\s*}}/)) {
        return null;
    }
    const divElement = document.createElement("div");
    divElement.innerHTML = template;
    return divElement.firstChild;
}

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