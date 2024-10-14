const { getDefaultConfig } = require("@expo/metro-config");
const config = getDefaultConfig(__dirname);

//Fixes
config.resolver.sourceExts.push("cjs");

config.resolver.sourceExts = process.env.RN_SRC_EXT
  ? [
      ...process.env.RN_SRC_EXT.split(",").concat(config.resolver.sourceExts),
      "cjs",
    ] // <-- cjs added here
  : [...config.resolver.sourceExts, "cjs"]; // <-- cjs added here

config.resolver.sourceExts.push("js", "json", "ts", "tsx", "cjs");

module.exports = config;