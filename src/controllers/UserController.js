const User = require('../models/User');
const Category = require('../models/Category');
const Ad = require('../models/Ad');
const { validationResult, matchedData } = require('express-validator');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');


module.exports = {
    info: async (req, res) => {
        let token = req.query.token;
        
        const user = await User.findOne({token});
        const ads = await Ad.find({idUser: user._id.toString()});
        
        let adList = [];
        for(let i in ads) {

            const cat = await Category.findById(ads[i].category);
            adList.push({ ...ads[i], category: cat.slug })
        }

        res.json({
            name: user.name,
            email: user.email,
            ads: adList
        });
    },
    editAction: async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            res.json({error: errors.mapped()});
            return;
        }
        const data = matchedData(req);

        let updates = {};

        if(data.name) {
            updates.name = name;
        }

        if(data.email) {
            const emailCheck = await User.findOne({email: data.email});
            if(emailCheck) {
                res.json({error: 'E-mail já existente!'});
                return;
            }
            updates.email = data.email;
        }

        if(data.password) {
            updates.passwordHash = await bcrypt.hash(data.password, 10);
        }

        await User.findOneAndUpdate({token: data.token}, {$set: updates})

        res.json({});
    }
}