
function getDialogId(userId1, userId2)
{
    let params;
    let id1 = userId1.toString();
    let id2 = userId2.toString();

    if(id1 < id2)
        params = {
            interlocutor1: id1,
            interlocutor2: id2
        };
    else
        params = {
            interlocutor1: id2,
            interlocutor2: id1
        };

    return params;
}


module.exports = {
    getDialogId
};