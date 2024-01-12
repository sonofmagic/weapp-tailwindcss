/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    {
      raw: 'prose prose-2xl prose-slate',
    },
  ],
  plugins: [require('@weapp-tailwindcss/typography')],
};
