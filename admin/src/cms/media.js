import { csrfHeader } from "../api.js";

// Uploads a file to the media library, reporting progress (large videos can take a while).
export function uploadMedia(file, { expect, alt = "", onProgress }) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    if (expect?.length) form.append("expect", expect.join(","));
    if (alt) form.append("alt", alt);
    form.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/media");
    xhr.responseType = "json";
    for (const [name, value] of Object.entries(csrfHeader())) xhr.setRequestHeader(name, value);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status < 300 ? resolve(xhr.response) : reject(new Error(xhr.response?.message ?? "The upload didn't work. Please try again.")));
    xhr.onerror = () => reject(new Error("Can't reach the FTCCI server. Check that it is running, then try again."));
    xhr.send(form);
  });
}

export const fileSize = (bytes) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
