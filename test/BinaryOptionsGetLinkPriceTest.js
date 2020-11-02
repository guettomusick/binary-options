const withData = require('leche').withData;
const {
    t,
    NULL_ADDRESS
} = require('./utils/consts');

const BinaryOptions = artifacts.require('./BinaryOptions.sol');

contract('BinaryOptionsGetLinkPriceTest', function (accounts) {

    let owner = accounts[0];
    let sender = accounts[1];

    withData({
        _1_valid_sender: [sender, false, undefined],
        _2_invalid_sender: [NULL_ADDRESS, true, '']
    }, function(
        sender,
        mustFail,
        expectedErrorMessage
    ){
        it(t('user', 'Should/should not be able to create an instance', mustFail), async function() {
            try {
                const instance = await BinaryOptions.new({ from: owner });
                const result = await instance.getLinkPrice({ from : sender })
                assert(!mustFail, 'It should have failed because the data is invalid');
                assert(result);
            } catch (error) {
                assert(mustFail, 'Should not have failed');
                assert.equal(error.reason, expectedErrorMessage)
            }

        })
    })
});