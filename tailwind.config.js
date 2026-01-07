module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}" // Ensure all relevant files are covered
  ],
  theme: {
    extend: {}
  },
  plugins: [require("daisyui")]
};
