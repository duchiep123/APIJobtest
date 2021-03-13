const google = require('googleapis')
const axios = require('axios')


/**
 * This scope tells google what information we want to request.
 */
const defaultScope = [
    'https://www.googleapis.com/auth/userinfo.profile'
];

const googleConfig = {
    clientId: '609373583403-iora6c7dvcrfodcquo10cluqfh5p2p1n.apps.googleusercontent.com',
    clientSecret: 'qWwZLIzPkk5lJ7fEAQZnEoOh',
    redirect: 'https://jobtestcom.herokuapp.com/users/authenticate/google'

}

const urlGG = 'https://www.googleapis.com/oauth2/v2/userinfo'

/**
 * Create the google auth object which gives us access to talk to google's apis.
 */

function createConnection() {
    return new google.Auth.OAuth2Client(
        googleConfig.clientId,
        googleConfig.clientSecret,
        googleConfig.redirect
    )
}


/**
 * Get a url which will open the google sign-in page and request access to the scope provided (such as calendar events).
 */
function getConnectionUrl(auth) {
    return auth.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent', // access type and approval prompt will force a new refresh token to be made each time signs in
        scope: defaultScope
    })
}



/**
 * Create the google url to be sent to the client.
 */
function urlGoogle() {
    const auth = createConnection() // this is from previous step
    const url = getConnectionUrl(auth)
    return url
}


/**
 * Extract the email and id of the google account from the "code" parameter.
 */
async function getGoogleAccountFromCode(code) {

    // get the auth "tokens" from the request
    const auth = createConnection();

    const tmp = await auth.getToken(code);
    const tokens = tmp.tokens;

    // add the tokens to the google api so we have access to the account

    auth.setCredentials(tokens);

    // get user info though access_token
    const { data } = await axios({ // { data }   => lấy kết quả là value của field data trong object JSON
            url: urlGG,
            method: 'get',
            params: {
                access_token: tokens.access_token
            }
        })
        // return so we can login or sign up the user
    return data;
}

module.exports = { urlGoogle, getGoogleAccountFromCode }