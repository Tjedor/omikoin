App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",

  init: function() {
    console.log("app initialized");
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== "undefined") {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider("http://localhost:7545");
      web3 = new Web3(App.web3Provider);
    }
    web3.version.getNetwork(function(err, res) {});
    return App.initContracts();
  },

  initContracts: function() {
    $.getJSON("OmikoinTokenSale.json", function(omikoinTokenSale) {
      App.contracts.OmikoinTokenSale = TruffleContract(omikoinTokenSale);
      App.contracts.OmikoinTokenSale.setProvider(App.web3Provider);
      App.contracts.OmikoinTokenSale.deployed().then(function(omikoinTokenSale) {
        console.log("Sale address:", omikoinTokenSale.address);
      });
    }).done(function() {
      $.getJSON("OmikoinToken.json", function(omikoinToken) {
        App.contracts.OmikoinToken = TruffleContract(omikoinToken);
        App.contracts.OmikoinToken.setProvider(App.web3Provider);
        App.contracts.OmikoinToken.deployed().then(function(omikoinToken) {
          console.log("Token address:", omikoinToken.address);
        });
        return App.render();
      });
    });
  },

  render: function() {
    //Load account  data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        console.log("account: " + account);
        App.account = account;
        $("#accountAddress").html("Your account: " + account);
      }
    });
  }
};
$(function() {
  $(window).load(function() {
    App.init();
  });
});
