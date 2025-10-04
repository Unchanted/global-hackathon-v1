import { Neo4jGraphQL } from '@neo4j/graphql';
import fs from 'fs';
import path from 'path';

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

async function generateSchema() {
  try {
    console.log('Generating GraphQL schema...');
    
    const neoSchema = new Neo4jGraphQL({
      typeDefs,
    });

    const schema = await neoSchema.getSchema();
    const schemaString = schema.toString();
    
    // Write schema to file
    const schemaPath = path.join(process.cwd(), 'generated-schema.graphql');
    fs.writeFileSync(schemaPath, schemaString);
    
    console.log(`✅ GraphQL schema generated successfully at ${schemaPath}`);
    console.log(`📊 Schema contains ${schemaString.split('type ').length - 1} types`);
    
  } catch (error) {
    console.error('❌ Error generating schema:', error);
    process.exit(1);
  }
}

generateSchema();