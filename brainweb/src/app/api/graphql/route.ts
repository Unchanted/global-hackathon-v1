import { Neo4jGraphQL } from '@neo4j/graphql';
import { ApolloServer } from '@apollo/server';
import { NextRequest, NextResponse } from 'next/server';
import driver from '@/lib/neo4j';

const typeDefs = `
  type Concept {
    id: ID! @id
    title: String!
    description: String
    difficulty: Int!
    prerequisites: [Concept!]! @relationship(type: "PREREQUISITE", direction: OUT)
    coOccurrences: [Concept!]! @relationship(type: "CO_OCCURS_WITH", direction: BOTH)
    createdAt: DateTime! @timestamp(operations: [CREATE])
    updatedAt: DateTime! @timestamp(operations: [CREATE, UPDATE])
  }

  type LearningPath {
    id: ID! @id
    name: String!
    description: String
    concepts: [Concept!]! @relationship(type: "INCLUDES", direction: OUT)
    difficulty: Int!
    estimatedTime: Int!
    createdAt: DateTime! @timestamp(operations: [CREATE])
    updatedAt: DateTime! @timestamp(operations: [CREATE, UPDATE])
  }

  type User {
    id: ID! @id
    email: String! @unique
    name: String!
    purpose: String!
    baselineKnowledge: [String!]!
    notebooks: [Notebook!]! @relationship(type: "OWNS", direction: OUT)
    createdAt: DateTime! @timestamp(operations: [CREATE])
    updatedAt: DateTime! @timestamp(operations: [CREATE, UPDATE])
  }

  type Notebook {
    id: ID! @id
    name: String!
    description: String
    concepts: [Concept!]! @relationship(type: "CONTAINS", direction: OUT)
    learningPath: LearningPath @relationship(type: "FOLLOWS", direction: OUT)
    progress: Float!
    createdAt: DateTime! @timestamp(operations: [CREATE])
    updatedAt: DateTime! @timestamp(operations: [CREATE, UPDATE])
  }

  type Query {
    concepts: [Concept!]!
    concept(id: ID!): Concept
    learningPaths: [LearningPath!]!
    learningPath(id: ID!): LearningPath
    users: [User!]!
    user(id: ID!): User
    notebooks: [Notebook!]!
    notebook(id: ID!): Notebook
  }

  type Mutation {
    createConcept(title: String!, description: String, difficulty: Int!): Concept!
    createLearningPath(name: String!, description: String, difficulty: Int!, estimatedTime: Int!): LearningPath!
    createUser(email: String!, name: String!, purpose: String!, baselineKnowledge: [String!]!): User!
    createNotebook(name: String!, description: String, userId: ID!): Notebook!
    addConceptToNotebook(notebookId: ID!, conceptId: ID!): Notebook!
    updateNotebookProgress(notebookId: ID!, progress: Float!): Notebook!
  }
`;

let server: ApolloServer;

async function getServer() {
  if (!server) {
    const neoSchema = new Neo4jGraphQL({
      typeDefs,
      driver,
    });

    server = new ApolloServer({
      schema: await neoSchema.getSchema(),
    });
  }
  return server;
}

export async function GET(request: NextRequest) {
  const apolloServer = await getServer();
  
  const url = new URL(request.url);
  const query = url.searchParams.get('query');
  const variables = url.searchParams.get('variables');
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }
  
  try {
    const result = await apolloServer.executeOperation({
      query,
      variables: variables ? JSON.parse(variables) : undefined,
    });
    
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'GraphQL execution failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const apolloServer = await getServer();
  
  try {
    const body = await request.json();
    const result = await apolloServer.executeOperation(body);
    
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'GraphQL execution failed' }, { status: 500 });
  }
}