import React from "react";
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import NoMatch from "./pages/NoMatch";
import SingleThought from "./pages/SingleThought";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";

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

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("id_token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// instantiate a new cache object
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

// Note how we wrap the entire returning JSX code with <ApolloProvider>. Because we're passing the client variable in as the value for the client prop in the provider, everything between the JSX tags will eventually have access to the server's API data through the client we set up
function App() {
  return (
    <ApolloProvider client={client}>
      {/* Router makes all of the child components on the page aware of the client-side routing that can take place now. */}
      <Router>
        <div className="flex-column justify-flex-start min-100-vh">
          <Header />
          <div className="container">
            {/* Using Switch if the route doesn't match any of the preceding paths (e.g., /about), then users will see the 404 message. */}
            <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/signup" component={Signup} />
              <Route exact path="/profile" component={Profile} />
              <Route exact path="/thought" component={SingleThought} />
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
