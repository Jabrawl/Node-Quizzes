const { GraphQLString, GraphQLNonNull, GraphQLList } = require('graphql')
const { QuestionInputType, AnswerInputType } = require('./types')
const { User, Quiz, Question, Submission } = require('../models')
const { createJWT } = require('../util/auth')



const register = {
    type: GraphQLString,
    args: {
        username:{ type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString }
    },

    async resolve(parent, args) {
        const checkUser = await User.findOne({ email:args.email })

        if (checkUser) {
            throw new Error("User with this email address already exists.")
        }

        const newUser = new User({
            username: args.username,
            password: args.password,
            email: args.email
        })


        await newUser.save()

        const token = createJWT(newUser)
        return token
    }
}

const login = {
    type: GraphQLString,
    args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString }
    },

    async resolve(parent, args) {
        const user = await User.findOne({email: args.email})

        if (!user || user.password !== args.password){
            throw new Error("Password incorrect or user with email does not exist!")
        }

        const token = createJWT(user)
        return token
    }
}

const createQuiz = {
    type: GraphQLString,
    args: {
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        userId: { type: GraphQLString },
        questions: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(QuestionInputType)))}
    },
    async resolve(parent, args) {
        const slug = args.title.toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replaceAll(' ', '-')
        let fullSlug = ''

        while(true){
            let slugId = Math.floor(Math.random() * 1000000)
            fullSlug = slug + slugId

            const existingQuiz = await Quiz.findOne({ slug: fullSlug })

            if (!existingQuiz) {
                break
            }
        }

        const quiz = new Quiz({
            title: args.title,
            description: args.description,
            userId: args.userId,
            slug: fullSlug
        })

        await quiz.save()

        for (const question of args.questions) {
            const questionObject = new Question({
                title: question.title,
                correctAnswer: question.correctAnswer,
                order: question.order,
                quizId: quiz.id
            })
            questionObject.save()
        }
        return quiz.slug
    }
}

const submitQuiz = {
    type: GraphQLString,
    args: {
        answers: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AnswerInputType))) },
        quizId: { type: GraphQLString },
        userId: { type: GraphQLString }
    },
    async resolve(parent,args) {
        let correct = 0
        let totalScore = args.answers.length

        for (const answer of args.answers) {
            const question = await Question.findById(answer.questionId)

            if (answer.answer.trim().toLowerCase() == question.correctAnswer.trim().toLowerCase()) {
                correct++
            }
        }

        const score = (correct / totalScore) * 100

        const submission = new Submission({
            userId: args.userId,
            quizId: args.quizId,
            score: score
        })

        await submission.save()

        return submission.id
    }
}

module.exports = {
    register,
    login,
    createQuiz,
    submitQuiz
}