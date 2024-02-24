const { validationResult, matchedData } = require('express-validator');

const bcrypt = require('bcrypt');

const User = require('../models/User');

module.exports = {
    signin: async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            res.json({error: errors.mapped()});
            return;
        }
        const data = matchedData(req);

        const user = await User.findOne({email: data.email});
        if(!user) {
            res.json({error: 'E-mail e/ou senha errados.'})
            return;
        }

        const match = await bcrypt.compare(data.password, user.passwordHash);
        if(!match) {
            res.json({error: 'E-mail e/ou senha errados.'});
            return;
        }

        //const payload = (Date.now() + Math.random()).toString();
        //const token = await bcrypt.hash(payload, 10);
        
        //user.token = token;
        await user.save();

        res.json({token:user.token, email: data.email});

    },
    signup: async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            res.json({error: errors.mapped()});
            return;
        }
        const data = matchedData(req);

        const user = await User.findOne({
            email: data.email
        });
        if(user) {
            res.json({
                error: {email:{msg: 'Email já existe'}}
            });
            return;
        }

        const passwordHash = await bcrypt.hash(data.password, 10);

        const payload = (Date.now() + Math.random()).toString();
        const token = await bcrypt.hash(payload, 10);

        const newUser = new User({
            name: data.name,
            email: data.email,
            passwordHash,
            token
        });
        await newUser.save();

        res.json({token});
    }
}