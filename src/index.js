import Asteroid from "./asteroid";

import ddp from "./mixins/ddp";
import methods from "./mixins/methods";
import subscriptions from "./mixins/subscriptions";
import passwordLogin from "./mixins/password-login";

Asteroid
    .mixin(ddp)
    .mixin(methods)
    .mixin(subscriptions)
    .mixin(passwordLogin);
