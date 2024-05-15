import type {Config} from 'jest';

const config: Config = {
  preset: "ts-jest",
  // https://stackoverflow.com/questions/69226759/jest-unexpected-token-export-when-using-d3
  moduleNameMapper: {
    '^d3-selection$': '<rootDir>/node_modules/d3-selection/dist/d3-selection.min.js',
    '^d3-array$': '<rootDir>/node_modules/d3-array/dist/d3-array.min.js',
    '^d3-scale$': '<rootDir>/node_modules/d3-scale/dist/d3-scale.min.js',
    '^d3-interpolate$': '<rootDir>/node_modules/d3-interpolate/dist/d3-interpolate.min.js',
    '^d3-color$': '<rootDir>/node_modules/d3-color/dist/d3-color.min.js',
    '^d3-format$': '<rootDir>/node_modules/d3-format/dist/d3-format.min.js',
    '^d3-time$': '<rootDir>/node_modules/d3-time/dist/d3-time.min.js',
    '^d3-time-format$': '<rootDir>/node_modules/d3-time-format/dist/d3-time-format.min.js',
    '^d3-axis$': '<rootDir>/node_modules/d3-axis/dist/d3-axis.min.js',
    '^d3-shape$': '<rootDir>/node_modules/d3-shape/dist/d3-shape.min.js',
    '^d3-path$': '<rootDir>/node_modules/d3-path/dist/d3-path.min.js',
  },
};

export default config;
