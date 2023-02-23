const { GraphQLSchema, GraphQLObjectType } = require('graphql')


const queries = require('./queries')
const mutations = require('./mutations')

const QueryType = new GraphQLObjectType({
    name: 'QueryType',
    description: "This type holds all of my queries",
    fields: queries
})

const MutationType = new GraphQLObjectType({
    name: 'MutationType',
    description: 'This type holds all of my mutations',
    fields: mutations
})

module.exports = new GraphQLSchema({
    query: QueryType,
    mutation: MutationType
})