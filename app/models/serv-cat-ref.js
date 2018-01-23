let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let moment = require('moment');
const DATE_FORMATS = require('../../config/datetime-formats');


let ServCatRefSchema = new Schema({
    serv_cat_name: { type : String , unique : true},
    description: String,
    is_active: Boolean,
    priority_val: Number,
    create_date: Date,
    update_date: Date,
});


ServCatRefSchema.statics.createNewCategory = function(params)
{
    let category = new this({
        serv_cat_name: params.serv_cat_name,
        description: params.serv_cat_description,
        is_active: false,
        priority_val: 999,
        create_date: moment().format(DATE_FORMATS.DATETIME),
        update_date: moment().format(DATE_FORMATS.DATETIME)
    });

    return category.save().then(c => c);
};


ServCatRefSchema.statics.checkIfProvidedCategoriesExist = function(arrayOfProvidedCatIds)
{

    return this.find({},'_id')
        .then(ids => {
            let existingCatIds = [];

            ids.forEach(elem => {
                existingCatIds.push(elem.id.toString())
            });

            let notExistedCats = [];

            arrayOfProvidedCatIds.forEach(elem => {
                existingCatIds.indexOf(elem) === -1? notExistedCats.push(elem) : '';
            });

            return notExistedCats;
        })
};


ServCatRefSchema.statics.searchCategory = function(params)
{
    let servCatName = new RegExp(params.serv_cat_name.trim(), 'i');

    return this.find({
        serv_cat_name: {
            $regex: servCatName
        },
        is_active: true
    })
        .sort([
            ['priority_val', 'ascending'],
            ['serv_cat_name', 'ascending'],
        ])
        .then(categories => categories)
};



module.exports = mongoose.model('ServCatRef', ServCatRefSchema, 'serv_cat_ref');