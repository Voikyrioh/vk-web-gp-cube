export default {
  define: {
    // @ts-ignore
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
};
