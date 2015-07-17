var bitcoinjs = require('bitcoinjs-lib')
var httpify = require('httpify')

function createNewAddress () {
  var privKey = bitcoinjs.ECKey.makeRandom()
  var testnet = bitcoinjs.networks.testnet

  return privKey.pub.getAddress(testnet).toString()
}

function requestUnconfirmedTransaction(callback) {
  var address = "mkU71dQZ5QAj2GspHfXW8ajgmx2hzYshUM"
  httpify({
    method: "POST",
    url: "https://testnet.helloblock.io/v1/faucet/withdrawal",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      toAddress: address,
      value: 1e4
    })
  }, function(err, res) {
    if (err) return callback(err)
    if (!res.body.data) return callback("Invalid JSend Response")

    callback(null, res.body.data.txHash, address)
  })
}

function requestNewUnspent(callback) {
  var key = bitcoinjs.ECKey.makeRandom();
  var value = 1e4

  httpify({
    method: 'POST',
    url: 'https://api.blocktrail.com/v1/tBTC/faucet/withdrawl?api_key=' + (process.env.BLOCKTRAIL_API_KEY || "c0bd8155c66e3fb148bb1664adc1e4dacd872548"),
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify({
      address: key.pub.getAddress(bitcoinjs.networks.testnet).toString(),
      amount: value
    })
  }, function(err, res) {
    if (err) return callback(err)

    var txb = new bitcoinjs.TransactionBuilder()
    var unspent = res.body

    txb.addInput(unspent.txHash, unspent.index)
    txb.addOutput('mkgqK39KnEkb1ockFBuGJy1pHQVN74oQDP', value)
    txb.sign(0, key)

    callback(undefined, txb.build())
  })
}

module.exports = {
  createNewAddress: createNewAddress,
  requestUnconfirmedTransaction: requestUnconfirmedTransaction,
  requestNewUnspent: requestNewUnspent
}
