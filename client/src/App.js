import React from "react";
// For navigating using links
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
// Apollo Client is a fully-featured caching GraphQL client with integrations for React, Angular, and more. It allows you to easily build UI components that fetch data via GraphQL.
// inMemoryCache -> For caching and updating the cache
// ApolloProvider -> This connects react with apollo client, we use it like we would the context API
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import NoMatch from "./pages/NoMatch";
import SingleThought from "./pages/SingleThought";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";

// httpLink sends each GraphQL operation to your server
// HttpLink is a terminating link that sends a GraphQL operation to a remote endpoint over HTTP amd supports both GET and POST requests
const httpLink = createHttpLink({
  uri: "/graphql",
});

// The _ means we are using it as a throw away place holder, this is the graphql request that is being executed
// The second arg is the previous context (a context is an object that is shared by all resolvers), we are destructuring the headers out of it then we are taking the token from the clients localStorage and we are passing down the headers (with the jwt) to all links
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("id_token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// ApolloClient encapsulates apollo's core client side api ~ In order to use to stuff we imported we put it in here
// Link -> An Apollo Link instance to serve as Apollo Client's network layer
// cache -> Required. The cache that Apollo Client should use to store query results locally. The recommended cache is InMemoryCache, which is provided by the @apollo/client package.
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  return (
    // Connecting apollo client with react, client (which is our context and url) is now available through out all components
    <ApolloProvider client={client}>
      {/* Uses history API to keep UI in sync with the current URL*/}
      <Router>
        <div className="flex-column justify-flex-start min-100-vh">
          <Header />
          <div className="container">
            {/* Depending on the url, render a different component */}
            <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/signup" component={Signup} />
              <Route exact path="/profile/:username?" component={Profile} />
              <Route exact path="/thought/:id" component={SingleThought} />

              <Route component={NoMatch} />
            </Switch>
          </div>
          <Footer />
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
