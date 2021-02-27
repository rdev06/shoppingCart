### Run Locally on Your Machine

You need Node, NPM and MongoDB properly installed.

Setup the environment variables replacing <MONGODB-PORT> with your mongodb port, usually is 27017.

```shell
    export MONGO_DB_URI=mongodb://localhost:<MONGODB-PORT>/shopping
    export STRIPE_SECRET_KEY=sk_test_bgBdBuFAydIEVdepmjpaJKUy
```

Install dependencies

```shell
    npm install
```

With your mongod service running, this will populate shopping database

```shell
    node seed/product-seeder.js
```

This will start dev server at http://localhost:3000 with Nodemon.

```shell
    npm run dev
```

### Tests

```shell
    npm test
```

### Technologies

###### Back-end

NodeJS, Express, MongoDB, Mongoose.

###### Fron-end

Handlebars and Bootstrap.

### Next version will have category of the items
