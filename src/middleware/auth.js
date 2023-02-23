const jwt = require('jsonwebtoken')

const unprotectedRoutes = [
    '/auth/login',
    '/auth/register',
    '/graphql'
]


const authenticate = (req, res, next) => {
    const token = req.cookies.JWT || ''

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET)

        req.verifiedUser = verified
        console.log("User verification successful")
        next()
    }

    catch(err){
        console.log('User Verification Failed')
        console.log(err)

        if (unprotectedRoutes.includes(req.path)) {
            next()
        } else {
            res.redirect('/auth/login')
        }
    }
}

module.exports = { authenticate }