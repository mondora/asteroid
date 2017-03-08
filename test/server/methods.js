Meteor.methods({
    echo: function () {
        return _.toArray(arguments);
    },
    throwError: function () {
        throw new Meteor.Error("Error message");
    },
    disconnectMe: function () {
        this.connection.close();
    },
    getUserById: function (id) {
        return Meteor.users.findOne({_id: id});
    },
    removeUserById: function (id) {
        return Meteor.users.remove({_id: id});
    },
    removeUserByUsername: function (username) {
        return Meteor.users.remove({username});
    },
    removeUserByEmail: function (email) {
        return Meteor.users.remove({
            "emails.0.address": email
        });
    }
});
