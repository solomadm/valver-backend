const moment = require('moment');

function getDaysForComparison()
{
    let arrayToCompare = [];

    for(let i = 7; i--; )
    {
        arrayToCompare.push(moment.utc().subtract(i, 'day').dayOfYear())
    }

    return arrayToCompare;
}


module.exports = {
    getDaysForComparison
};