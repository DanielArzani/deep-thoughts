import React from "react";
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";

// establish the connection to the back-end server's /graphql endpoint
// in production, we would have to change the uri each time
// const httpLink = createHttpLink({
//   uri: "http://localhost:3001/graphql",
// });

// URI stands for "Uniform Resource Identifier"
// don't forget to add "proxy": "http://localhost:3001", to package.json
// With this proxy value in place, the Create React App team set up the development server to prefix all HTTP requests using relative paths (e.g., /graphql instead of http://localhost:3001/graphql) with whatever value is provided to it. Now the HTTP requests will work in both development and production environments!
//& because package.json isn't part of the actual React application, the Hot Module Replacement aspect of the webpack development server doesn't listen for changes in that file. Thus, any change to the package.json file will always necessitate a manual restart of the server from the command line
const httpLink = createHttpLink({
  uri: "/graphql",
});

// instantiate a new cache object
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

// Note how we wrap the entire returning JSX code with <ApolloProvider>. Because we're passing the client variable in as the value for the client prop in the provider, everything between the JSX tags will eventually have access to the server's API data through the client we set up
function App() {
  return (
    <ApolloProvider client={client}>
      <div className="flex-column justify-flex-start min-100-vh">
        <Header />
        <div className="container">
          <Home />
        </div>
        <Footer />
      </div>
    </ApolloProvider>
  );
}

export default App;
