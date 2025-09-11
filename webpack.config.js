const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const { GenerateSW } = require('workbox-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// TerserPlugin is included in webpack 5 by default

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  // Cache configuration for faster rebuilds
  cache: {
    type: 'filesystem',
    buildDependencies: { 
      config: [__filename] 
    },
    version: 'v1-manylla-web'
  },
  mode: process.env.NODE_ENV || 'development',
  entry: './index.web.js',
  output: {
    path: path.resolve(__dirname, 'web/build'),
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js',
    publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.ttf$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]',
        },
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: [
          /node_modules\/(?!(react-native-gesture-handler)\/).*/,
          /\.native\.(ts|tsx)$/,
        ],
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            compilerOptions: {
              module: 'esnext',
              target: 'es5',
              jsx: 'react',
              allowJs: true,
              esModuleInterop: true,
              allowSyntheticDefaultImports: true,
            },
          },
        },
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules\/(?!(react-native-vector-icons|react-native-reanimated|@react-native|react-native)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              ['@babel/preset-react', { runtime: 'automatic' }],
              '@babel/preset-typescript',
            ],
            plugins: [
              'react-native-web',
              ['module-resolver', {
                alias: {
                  '^react-native$': 'react-native-web',
                }
              }]
            ],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name].[hash][ext]',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      '@react-native-async-storage/async-storage': path.resolve(__dirname, 'src/services/webStorage.js'),
      'react-native-vector-icons/MaterialIcons': 'react-native-vector-icons/dist/MaterialIcons',
      'react-native-get-random-values': path.resolve(__dirname, 'src/polyfills/getRandomValues.web.js'),
      '@react-native-community/datetimepicker': path.resolve(__dirname, 'src/components/DatePicker/DatePicker.web.js'),
      // Ignore native-only packages when building for web
      'react-native-qrcode-svg': false,
      'react-native-view-shot': false,
      'react-native-html-to-pdf': false,
    },
    extensions: ['.web.js', '.web.jsx', '.web.ts', '.web.tsx', '.js', '.jsx', '.ts', '.tsx'],
  },
  plugins: [
    // Ignore .native files when building for web
    new webpack.IgnorePlugin({
      resourceRegExp: /\.native\.(js|jsx|ts|tsx)$/,
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      title: 'manylla',
      meta: {
        viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
        description: 'Secure companion for managing your child\'s special needs journey',
      },
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      __DEV__: JSON.stringify(!isProduction),
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public/favicon.ico', to: 'favicon.ico', noErrorOnMissing: true },
        { from: 'public/favicon.svg', to: 'favicon.svg', noErrorOnMissing: true },
        { from: 'public/logo192.png', to: 'logo192.png', noErrorOnMissing: true },
        { from: 'public/logo512.png', to: 'logo512.png', noErrorOnMissing: true },
        { from: 'public/manifest.json', to: 'manifest.json', noErrorOnMissing: true },
        { from: 'public/robots.txt', to: 'robots.txt', noErrorOnMissing: true },
        { from: 'public/global-styles.css', to: 'global-styles.css', noErrorOnMissing: true },
        { from: 'public/vector-icons.css', to: 'vector-icons.css', noErrorOnMissing: true },
        { from: 'node_modules/react-native-vector-icons/Fonts', to: 'fonts' },
      ],
    }),
    ...(isProduction ? [
      new GenerateSW({
        clientsClaim: true,
        skipWaiting: true,
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      }),
    ] : []),
  ],
  optimization: {
    minimize: isProduction,
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 6,
      maxAsyncRequests: 4,
      cacheGroups: {
        // Separate MUI components into their own chunk
        mui: {
          test: /[\\/]node_modules[\\/]@mui[\\/]/,
          name: 'mui',
          priority: 30,
          chunks: 'all',
        },
        // Separate React ecosystem into its own chunk
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-native)[\\/]/,
          name: 'react',
          priority: 20,
          chunks: 'all',
        },
        // Separate other vendor libraries
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: -10,
          chunks: 'all',
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: 'single',
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    hot: true,
    historyApiFallback: true,
    open: true,
  },
  performance: {
    hints: isProduction ? 'warning' : false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
};