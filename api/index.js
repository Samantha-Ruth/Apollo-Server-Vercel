import { ApolloServer, gql } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import http from "http";
import express from "express";
import cors from "cors";

// CORS middleware to allow a thrid party domain to query the server
// JSON middleware to enable body data parsing so server can interpret POST requests

const app = express();

app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);

// Basic query and matching resolver to test Apollo server is working
const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => "world",
  },
};

// Method to bootstrap our Apollo server and attach it to Express app as simple middleware

const startApolloServer = async(app, httpServer) => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
        // Use ApolloServer drain plug in to add functionalities to Apollo Server
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    // The start method of the Apollo server instance is asynchronous, which is handled with an await
    await server.start();
    // Once server is started, bind it to the Express app with applyMiddleware() method
    server.applyMiddleware({ app });
}

// invoke startApolloServer and expoort the httpserver so Vercel can start it
startApolloServer(app, httpServer);

export default httpServer;

// Next, need to configure route rewrites to redirect any request to the /api
// folder of our project.  Create a file called vercel.json at the root o the project.