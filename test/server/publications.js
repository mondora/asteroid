Meteor.publish("echo", function () {
    var self = this;
    _.each(arguments, function (param, index) {
        self.added("echoParameters", "id_" + index, {param: param});
    });
    self.ready();
});

Meteor.publish("autoTerminating", function () {
    var self = this;
    self.added("autoTerminating", "id", {});
    self.ready();
    setTimeout(function () {
        self.stop();
    }, 1000);
});
