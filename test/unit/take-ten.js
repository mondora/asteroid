export default function takeTen (fn, done) {
    setTimeout(() => {
        var error;
        try {
            fn();
        } catch (e) {
            error = e;
        }
        done(error);
    }, 10);
}
