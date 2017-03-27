/* name
   date
   url
   description
   location
   image
   How to Enter
   Rules
   Eligibility
   Prizes
*/

var mongoose = require('mongoose');

var hackathonSchema = mongoose.Schema({
    name: {type: String, required: true},
    start_date: {type: Date, required: true},
    end_date: {type: Date, required: true},
    slogan: {type: String},
    url: {type: String, required: true},
    description: {type: String, required: true},
    location: {
        building: {type: String, required: true},
        street: {type: String, required: true},
        city: {type: String, required: true},
        postcode: {type: String},
        country: {type: String, required: true}
    },
    tags: [String],
    image: String,
    rules: [{type: String}],
    prizes: [{value: String, categories: [{type: String}]}],
    sponsors: [{logo: String, link: String}],
    eligibility: String,
    participants: [{type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true}]
}, {
    timestamps: true // Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
});

hackathonSchema.index({name: 'text'});


var HackathonModel = mongoose.model('Hackathon', hackathonSchema);