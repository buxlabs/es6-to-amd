'use strict';

module.exports = function getFreeIdentifier (identifiers) {
    var alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    var index = 0;
    while (identifiers.indexOf(alphabet[index]) !== -1) {
        index += 1;
        if (index === alphabet.length) {
            index = 0;
            alphabet = alphabet.map(character => '_' + character);
        }
    }
    return alphabet[index];
};