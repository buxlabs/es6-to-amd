function hash(str) {
    return str + '1';
}

export default function (str) {
    return '2' + hash(str);
}
