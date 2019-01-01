const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

router.get("/test", (req, res) => res.json({
    msg: "This is the users route"
}));

// check post
router.post('/register', (req, res) => {
    // Check to make sure nobody has already registered with a duplicate email
    User.findOne({
            email: req.body.email
        })
        .then(user => {
            if (user) {
                // Throw a 400 error if the email address already exists
                return res.status(400).json({
                    email: "A user has already registered with this address"
                })
            } else {
                // Otherwise create a new user
                const newUser = new User({
                    handle: req.body.handle,
                    email: req.body.email,
                    password: req.body.password
                })

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    })
                })
            }
        })
})

router.post("/login", (req, res) => {
    const {
        errors,
        isValid
    } = validateLoginInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    const name = req.body.name;
    const password = req.body.password;

    User.findOne({
        name
    }).then(user => {
        if (!user) {
            errors.name = "This user does not exist";
            return res.status(400).json(errors);
        }

        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                const payload = {
                    id: user.id,
                    name: user.name
                };

                jwt.sign(payload, keys.secretOrKeys, {
                    expiresIn: 3600
                }, (err, token) => {
                    res.json({
                        success: true,
                        token: "Bearer " + token
                    });
                });
            } else {
                errors.password = "Incorrect password";
                return res.status(400).json(errors);
            }
        });
    });
});

module.exports = router;