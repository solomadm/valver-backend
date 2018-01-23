function storeAuthToken(token)
{
    localStorage.setItem('auth',token);
}


function getAuthHeader()
{
    return 'JWT ' + localStorage.getItem('auth');
}


function storeUserId(userId)
{
    localStorage.setItem('user_id',userId);
}


function getLoggedUserId()
{
    return localStorage.getItem('user_id');
}


function setUserData(userData)
{
    localStorage.setItem('user_data', JSON.stringify(userData));
}
