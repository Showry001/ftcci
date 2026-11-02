// The public site is rendered on the server (React Router framework mode), so search engines and link
// previews get each page's real content and titles. Content comes from the FTCCI API.
export default {
  appDirectory: "src",
  ssr: true,
  basename: "/ftcci/",
  future: {
    v8_middleware: true,
    v8_splitRouteModules: true,
    v8_viteEnvironmentApi: true,
    v8_passThroughRequests: true,
    v8_trailingSlashAwareDataRequests: true,
  },
};
