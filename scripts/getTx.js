const ethers = require("ethers");
const config = require("dotenv");
const resolve = require("path");

config({ path: resolve(__dirname, "../.env") });

(async () => {
    console.log("Getting transaction...");
    const alchemyApiKey = process.env.ALCHEMY_API_KEY;
    const txHash = "";
})();
