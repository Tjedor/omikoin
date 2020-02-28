var OmikoinToken = artifacts.require("./OmikoinToken.sol");

contract("OmikoinToken", function(accounts) {
  var tokenInstance;

  it("initializes the contract with the correct values", function() {
    return OmikoinToken.deployed()
      .then(function(instance) {
        tokenInstance = instance;
        return tokenInstance.name();
      })
      .then(function(name) {
        assert.equal(name, "Omikoin", "has correct name");
        return tokenInstance.symbol();
      })
      .then(function(symbol) {
        assert.equal(symbol, "OMK", "has correct symbol");
        return tokenInstance.standard();
      })
      .then(function(standard) {
        assert.equal(standard, "Omikoin v1.0", "has coreect standard");
      });
  });

  it("sets the total supply upon deployment", function() {
    return OmikoinToken.deployed()
      .then(function(instance) {
        tokenInstance = instance;
        return tokenInstance.totalSupply();
      })
      .then(function(totalSupply) {
        assert.equal(
          totalSupply.toNumber(),
          1000000,
          "sets the total supply to 1 000 000"
        );
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then(function(adminBalance) {
        assert.equal(
          adminBalance.toNumber(),
          1000000,
          "it allocates initial supply to admin"
        );
      });
  });

  it("transfers ownership", function() {
    return OmikoinToken.deployed()
      .then(function(instance) {
        tokenInstance = instance;
        return tokenInstance.transfer.call(accounts[1], 99999999999999);
      })
      .then(assert.fail)
      .catch(function(error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "error, message must contain revert"
        );
        return tokenInstance.transfer(accounts[1], 250000, {
          from: accounts[0]
        });
      })
      .then(function(receipt) {
        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(
          receipt.logs[0].event,
          "Transfer",
          "should be transfer event"
        );
        assert.equal(receipt.logs[0].args._from, accounts[0]);
        assert.equal(receipt.logs[0].args._to, accounts[1]);
        assert.equal(receipt.logs[0].args._value, 250000, "transefr amount");
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then(function(balance) {
        assert.equal(balance.toNumber(), 750000, "deducts from sender ");
      });
  });

  it("approves tokens for delegated transfer", function() {
    return OmikoinToken.deployed()
      .then(function(instance) {
        tokenInstance = instance;
        return tokenInstance.approve.call(accounts[1], 100);
      })
      .then(function(success) {
        assert.equal(success, true, "it return true ");
        return tokenInstance.approve(accounts[1], 100);
      })
      .then(function(receipt) {
        assert.equal(receipt.logs.length, 1, "triggers oine event");
        assert.equal(
          receipt.logs[0].event,
          "Approval",
          "should be the approval event"
        );
        assert.equal(
          receipt.logs[0].args._owner,
          accounts[0],
          "logs the account the tokens are authorized by"
        );
        assert.equal(
          receipt.logs[0].args._spender,
          accounts[1],
          "logs the account the tokens are authorized to"
        );
        assert.equal(receipt.logs[0].args._value, 100, "logs the aount");
        return tokenInstance.allowance(accounts[0], accounts[1]);
      })
      .then(function(allowance) {
        assert.equal(
          allowance.toNumber(),
          100,
          "stores the allowance for delegated transfer"
        );
      });
  });

  it("handles delegated token transfers", function() {
    return OmikoinToken.deployed()
      .then(function(instance) {
        tokenInstance = instance;
        fromAccount = accounts[2];
        toAccount = accounts[3];
        spendingAccount = accounts[4];
        // transfer some tokens to fromaccount
        return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
      })
      .then(function(receipt) {
        return tokenInstance.approve(spendingAccount, 10, {
          from: fromAccount
        });
      })
      .then(function(receipt) {
        //try transferring something larger than the sencers balance
        return tokenInstance.transferFrom(fromAccount, toAccount, 9999, {
          from: spendingAccount
        });
      })
      .then(assert.fail)
      .catch(function(error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "cannot transfer value larger than balance"
        );
        return tokenInstance.transferFrom(fromAccount, toAccount, 20, {
          from: spendingAccount
        });
      })
      .then(assert.fail)
      .catch(function(error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "cannot transfer value larger than approved amount"
        );
        return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {
          from: spendingAccount
        });
      })
      .then(function(success) {
        assert.equal(success, true);
        return tokenInstance.transferFrom(fromAccount, toAccount, 10, {
          from: spendingAccount
        });
      })
      .then(function(receipt) {
        assert.equal(receipt.logs.length, 1, "triggers one event");
        assert.equal(
          receipt.logs[0].event,
          "Transfer",
          "should be transfer event"
        );
        assert.equal(
          receipt.logs[0].args._from,
          fromAccount,
          "logs the from account"
        );
        assert.equal(receipt.logs[0].args._to, toAccount, "logs the toaccount");
        assert.equal(receipt.logs[0].args._value, 10, "transefr amount");
        return tokenInstance.balanceOf(fromAccount);
      })
      .then(function(balance) {
        assert.equal(balance.toNumber(), 90, "CHECKS BALANCE OF fromaxccount");
        return tokenInstance.balanceOf(toAccount);
      })
      .then(function(balance) {
        assert.equal(
          balance.toNumber(),
          10,
          "CHECKS BALANCE OF receiving account"
        );
        return tokenInstance.allowance(fromAccount, spendingAccount);
      })
      .then(function(allowance) {
        assert.equal(
          allowance.toNumber(),
          0,
          "deeducts the amount from the allowance"
        );
      });
  });
});
