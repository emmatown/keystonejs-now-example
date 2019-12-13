const { Keystone } = require("@keystonejs/keystone");
const { PasswordAuthStrategy } = require("@keystonejs/auth-password");
const { Text, Checkbox, Password } = require("@keystonejs/fields");
const { GraphQLApp } = require("@keystonejs/app-graphql");
const { AdminUIApp } = require("@keystonejs/app-admin-ui");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

const initialiseData = require("./initial-data");

/* keystone-cli: generated-code */
const { MongooseAdapter: Adapter } = require("@keystonejs/adapter-mongoose");
const PROJECT_NAME = "My KeystoneJS Project";
/* /keystone-cli: generated-code */

let adapter = new Adapter();

const keystone = new Keystone({
  name: PROJECT_NAME,
  adapter,
  onConnect: initialiseData,
  sessionStore: new MongoStore({
    mongooseConnection: adapter.mongoose.connection
  })
});

// Access control functions
const userIsAdmin = ({ authentication: { item: user } }) =>
  Boolean(user && user.isAdmin);
const userOwnsItem = ({ authentication: { item: user } }) => {
  if (!user) {
    return false;
  }
  return { id: user.id };
};
const userIsAdminOrOwner = auth => {
  const isAdmin = access.userIsAdmin(auth);
  const isOwner = access.userOwnsItem(auth);
  return isAdmin ? isAdmin : isOwner;
};
const access = { userIsAdmin, userOwnsItem, userIsAdminOrOwner };

keystone.createList("User", {
  fields: {
    name: { type: Text },
    email: {
      type: Text,
      isUnique: true
    },
    isAdmin: { type: Checkbox },
    password: {
      type: Password
    }
  },
  access: {
    read: access.userIsAdminOrOwner,
    update: access.userIsAdminOrOwner,
    create: access.userIsAdmin,
    delete: access.userIsAdmin,
    auth: true
  }
});

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: "User"
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp({
      enableDefaultRoute: true,
      authStrategy
    })
  ]
};
