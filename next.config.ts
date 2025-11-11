const WebpackObfuscator = require("webpack-obfuscator");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer && process.env.NODE_ENV === "production") {
      config.plugins.push(
        new WebpackObfuscator(
          {
            rotateStringArray: true,
            stringArray: true,
            stringArrayEncoding: ["base64"],
            stringArrayThreshold: 0.75,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.4,
            identifierNamesGenerator: "hexadecimal",
            unicodeEscapeSequence: false,
          },
          [
            "feature.ts", // Obfuscate file này
            "node_modules/**",
            "**/*.tsx",
          ]
        )
      );
    }
    return config;
  },
};

module.exports = nextConfig;
