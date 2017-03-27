var mongoose = require('mongoose'),
    encrypt = require('../utilities/encryption');

var userSchema = mongoose.Schema({
    name: {type: String, required: '{PATH} is required'},
    email: {
        type: String,
        required: '{PATH} is required',
        unique: true
    },
    profile: {
        role: String,
        employment: {
            company: String,
            job_title: String
        },
        education: {
            school: String,
            degree: String,
            country: String
        },
        address: {
            city: String,
            country: String
        },
        projectTypes: [String],
        skills: [String],
        picture: {type: String, default: "../images/default-profile-pic.png"},
        bio: String,
        experience: Number,
        personalWebsite: String,
        connections: [{type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true}],
        hackathons: [{type: mongoose.Schema.Types.ObjectId, ref: 'Hackathon', unique: true, index: true}],
        socialProfiles: {
            "facebook": String,
            "linkedIn": String,
            "github": String
        }
    },
    salt: {type: String},
    hashed_password: {type: String},
    linkedIn: {
        id: String,
        token: String
    },
    roles: [],
    verify: {type: Boolean, default: true}
});

userSchema.methods = {
    authenticate: function(passwordToMatch) {
        return encrypt.hashPassword(this.salt, passwordToMatch) === this.hashed_password;
    }
}

userSchema.index({name: 'text'});

var User = mongoose.model('User', userSchema);
User.ensureIndexes(function(err) {
    if (err)
        console.log(err);
    else
        console.log('create hackathon index successfully');
});


