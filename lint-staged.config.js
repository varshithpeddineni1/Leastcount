export default {
  '*.{js,jsx,mjs,cjs,ts,tsx,json,md,yml,yaml,css,html}': ['prettier --write'],
  '*.{js,jsx,mjs,cjs,ts,tsx}': ['eslint --fix'],
};
