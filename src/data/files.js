// Documents that still live on the current ftcci.in site, until they move into the CMS media library.
// The dev server relays them same-origin (see vite.config.js) so the PDF reader and downloads work locally;
// production builds link to ftcci.in, where browsers open them in a new tab instead.
const base = import.meta.env.DEV ? `${import.meta.env.BASE_URL}ftcci-files/` : "https://www.ftcci.in/source/";

export const ftcciFile = (path) => base + path.split("/").map(encodeURIComponent).join("/");
