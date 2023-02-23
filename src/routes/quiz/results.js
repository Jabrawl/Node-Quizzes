const axios = require('axios')

module.exports = async (req, res) => {
    const query = `
    query submission($id: ID!) {
        submission(id: $id){
            id,
            quiz {
                title
            },
            user {
                id
            },
            score
        }
    }`

    let submission = {}

    try {
        const { data } = await axios.post('http://localhost:3000/graphql',
        {
            query,
            variables: {
                id: req.params.id
            }
        },
        {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        submission = data.data.submission

        if(submission.user.id !== req.verifiedUser.user._id){
            res.redirect('/')
        }
    } catch(err) {
        console.log(err)
    }
    res.render('quiz-results', { submission })
}
