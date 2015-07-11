export default function fingerprintSub (name, params) {
    return JSON.stringify({name, params});
}
