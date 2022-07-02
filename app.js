const express = require('express')
const app = express();
const port = process.env.PORT || 3000;
const path = require("path")
const hbs = require("express-handlebars")
const mongoose = require("mongoose")
const flash = require('connect-flash')
const session = require('express-session')
const passport = require("passport")
require("./config/passport")(passport);
const methodOverride = require('method-override');
const Items = require('./models/items')
const bcrypt = require('bcryptjs');
const Users = require('./models/User')
const Owner = require('./models/owner')
const Handlebars = require('handlebars')

const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const { ensureAuth } = require('./config/auth');
app.use(express.urlencoded({ extended: true }))

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}))
app.use(methodOverride('_method'));


app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");

    next();
})

const db = require("./config/keys").MongoURI
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true, })
    .then(() => console.log("Mongodb Connected!"))
    .catch(err => console.log(err))


app.use(passport.initialize());
app.use(passport.session());
app.use("/", require("./Routes/index"));
app.use("/users", require("./Routes/users"));
app.use(express.static(path.join(__dirname, 'public')));




app.set("views", path.join(__dirname, "views"))
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
    extname: "hbs",
    defaultLayout: 'layout',
    LayoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + '/views/partials/',
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}));
var owners = []
var firstUser = []

Owner.findOne({ firstname: "Ali" })
    .then(owner => {
        if (!owner) {
            const owner = new Owner({
                firstname: "Ali",
                lastname: "Normohammadzadeh"
            })
            owner.save()
                .then(owner => console.log(owner))
                .catch(err => console.log(err))
        } else {
            owners = owner
        }
    })
    .catch(err => console.log(err))


Users.findOne({ number: 0925823503, })
    .then(user => {
        if (!user) {
            const user = new Users({
                firstname: "ali",
                lastname: "normohammadzade",
                number: "0925823503",
                description: "danshjo i karshenasi",
            })
            user.save()
                .then(user => console.log(user))
                .catch(err => console.log(err))
        } else {
            firstUser = user
        }
    })

.catch(err => console.log(err))

app.get('/shop', function(req, res) {
    Items.find({})
        .then(items => {
            res.render('shop', { shopitems: items, owners: owners })
        })
        .catch(err => console.log(err))
})


app.post('/shop', ensureAuth, function(req, res) {
    const { title, price, description, img } = req.body
    const newItem = new Items({ title, price, description, img })
    newItem.save()

    res.redirect('/shop')
})
app.get('/add', (req, res) => {
    res.render('add', { owners: owners })
})

app.post("/add", ensureAuth, (req, res) => {
    const { title, price, description, img } = req.body
    const newItem = new Items({ title, price, description, img })
    newItem.save()

    res.redirect('/shop')
})

app.get('/shop/:id', function(req, res) {
    Items.findOne({ _id: req.params.id })
        .then(item => {
            console.log(item)
            res.render('shopitem', { item: item, owners: owners })
        })
        .catch(err => console.log(err))
})

app.get('/userinfo/:id', (req, res) => {
    Users.findOne({ _id: req.params.id })
        .then(user => {
            res.render('userinfo', { user: user })
        })
        .catch(err => console.log(err))
})

app.delete('/shop/:id', ensureAuth, function(req, res) {
    var Vote = req.body.vote;
    if (Vote == "Edit") {
        Items.findOne({ _id: req.params.id })
            .then(item => {
                res.render('shopitem', { item: item, owners: owners })
            })
            .catch(err => console.log(err))
    } else if (Vote == "Delete") {
        Items.findOneAndDelete({ _id: req.params.id }, function(err) {
            if (err) {
                console.log(err)
            } else {
                res.redirect('/shop')
            }
        })

    };

});

app.put('/shop/:id', ensureAuth, function(req, res) {
    const filter = { _id: req.params.id }
    const { title, price, description, img } = req.body
    console.log(req.body)
    console.log(title, price, description, img)
    Items.findOneAndUpdate(filter, { title: title, price: price, description: description, img: img }, { new: true }, function(err, doc) {
        if (err) {
            console.log(err)
        } else {
            console.log(doc)
            res.redirect('/shop')
        }
    })
})
app.get("/userinfo", (req, res) => {
    res.render('userinfo', { users: firstUser, owners: owners });
})

app.put('/userinfo', async function(req, res) {
    const { firstname, lastname, number, description } = req.body;
    Users.findOne({ number: number })
        .then(user => {
            if (user) {
                res.status(500).send("User is already exist")
            } else {
                const newUser = new Users({ firstname, lastname, number, description })
                newUser.save()
                    .then(user => {
                        res.render('userinfo', { users: user, owners: owners })
                    })
                    .catch(err => console.log(err))
            }
        })
        .catch(err => console.log(err))
})
app.get("/edit", (req, res) => {
    res.render('edit')
})

app.get("/about", (req, res) => {
    res.render("about")
})

// app.all('*', (req, res) => {
//     res.status(404).send('<h1>Resource not Found</h1>')
// })


app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
})