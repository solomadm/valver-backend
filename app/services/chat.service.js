let DialoguesAndChats = {};

const chat = {

    subscribe: function(req, res, id)
    {
        if(DialoguesAndChats[id] === undefined)
            DialoguesAndChats[id] = [];

        DialoguesAndChats[id].push(res);

        res.on('close', ()=>{
            DialoguesAndChats[id].splice(DialoguesAndChats[id].indexOf(res),1)
        })
    },

    publish: function(message, id)
    {
        DialoguesAndChats[id].forEach(res => {
            res.json({message})
        });

        DialoguesAndChats[id] = [];
    }

};

module.exports = chat;