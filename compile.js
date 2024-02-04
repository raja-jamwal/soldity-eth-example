const path = require("path");
const fs = require("fs");
const solc = require("solc");

const donationCampaignPath = path.resolve(__dirname, "contracts", "DonationCampaign.sol");
const source = fs.readFileSync(donationCampaignPath, "utf8");

module.exports = solc.compile(source, 1).contracts[":DonationCampaign"];
