module.exports = function fingerprintSub (name, params) {
    return JSON.stringify({
        name: name,
        params: params
    });
};
