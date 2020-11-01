const withData = require('leche').withData;
const {
    t,
    NULL_ADDRESS
} = require('./utils/consts');

const BinaryOptions = artifacts.require('./BinaryOptions.sol');

contract('BinaryOptionsConstructorTest', function (accounts) {

    let owner = accounts[0];

    withData({
        _1_valid_address: [owner, false, undefined],
    }, function(
        sender,
        mustFail,
        expectedErrorMessage
    ){
        it(t('user', 'Should/should not be able to create an instance', mustFail), async function() {
            try {
                const result = await BinaryOptions.new({ from: sender });
                assert(!mustFail, 'It should have failed because the data is invalid');
                assert(result);
            } catch (error) {
                assert(mustFail, 'Should not have failed');
                assert.equal(error.reason, expectedErrorMessage)
            }

        })
    })
});