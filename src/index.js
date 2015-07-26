import Asteroid from "./asteroid";

import * as ddp from "./mixins/ddp";
import * as methods from "./mixins/methods";
import * as subscriptions from "./mixins/subscriptions";
import * as passwordLogin from "./mixins/password-login";

export default Asteroid
    .mixin(ddp)
    .mixin(methods)
    .mixin(subscriptions)
    .mixin(passwordLogin);
