Meteor.methods({
    echo: function () {
        return _.toArray(arguments);
    },
    throwError: function () {
        throw new Meteor.Error("Error message");
    },
    disconnectMe: function () {
        this.connection.close();
    }
});
