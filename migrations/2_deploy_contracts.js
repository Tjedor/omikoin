var OmikoinToken = artifacts.require("./OmikoinToken.sol");
var OmikoinTokenSale = artifacts.require("./OmikoinTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(OmikoinToken, 1000000).then(function() {
    return deployer.deploy(OmikoinTokenSale, OmikoinToken.address, 1000000000000000);
  });
};
