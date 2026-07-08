export default {
  '*.{js,jsx,ts,tsx,json,md,yml,yaml,css,html}': ['prettier --write'],
  '*.{js,jsx,ts,tsx}': ['eslint --fix'],
};
