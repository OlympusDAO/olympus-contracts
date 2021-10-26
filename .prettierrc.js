module.exports = {
  singleQuote: true,
  bracketSpacing: false,
  printWidth: 120,
  overrides: [
    {
      files: '*.sol',
      options: {
        printWidth: 250,
        tabWidth: 2,
        singleQuote: false,
        explicitTypes: 'always',
      },
    },
  ],
  plugins: [require.resolve('prettier-plugin-solidity')],
};
