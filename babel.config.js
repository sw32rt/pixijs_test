const presets = [
  [
    "@babel/preset-env",
    {
      targets: {
        // edge: "17",
        // firefox: "60",
        chrome: "110",
        // safari: "11.1",
      },
      useBuiltIns: "usage",
      corejs: "3.6.4",
    },
  ],
];

const plugins = [
  [
    require.resolve('babel-plugin-module-resolver'),
    {
      root: ["./"],
      alias: {
        "@pixi": "./node_modules/@pixi"
      }
    }

  ]

];

module.exports = { presets, plugins };
