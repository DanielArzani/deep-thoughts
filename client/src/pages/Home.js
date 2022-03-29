import React from "react";
import ThoughtList from "../components/ThoughtList";
import ThoughtForm from "../components/ThoughtForm";
import FriendList from "../components/FriendList";

import Auth from "../utils/auth";
//  To run a query within a React component, call useQuery and pass it a GraphQL query string. When your component renders, useQuery returns an object from Apollo Client that contains loading, error, and data (and others, but these are the most commonly used) properties you can use to render your UI.
import { useQuery } from "@apollo/client";
// Query_Me_Basic shows the user info and their friends while Query_Thoughts shows a list of all thoughts
// We only need the data we get from these expressions
// This is like making a GET request inline and having all the data available as objects
import { QUERY_THOUGHTS, QUERY_ME_BASIC } from "../utils/queries";

const Home = () => {
  // We are taking out the Thought collection data returned from the query as well as the loading object which we can use to display something until the async function has finished fetching the data
  const { loading, data } = useQuery(QUERY_THOUGHTS);
  // We are pulling out the data and giving it an alias
  const { data: userData } = useQuery(QUERY_ME_BASIC);
  // Optional chaining -> If data is isn't a falsy value, assign data.thoughts to thoughts else assign an empty array
  // This is so we don't get an error
  // I think this works even though thoughts will be an empty array at first because React re-renders the a component when loading is completed and this data is being re-rendered along with it (if we didn't want it to, we would have to put it in a useEffect hook)
  const thoughts = data?.thoughts || [];
  // Auth.loggedIn only returns true if the token exists and isn't expired
  const loggedIn = Auth.loggedIn();

  return (
    <main>
      <div className="flex-row justify-space-between">
        {/* If loggedIn is true, render ThoughtForm component */}
        {loggedIn && (
          <div className="col-12 mb-3">
            <ThoughtForm />
          </div>
        )}
        {/* If loggedIn is true, render this style */}
        <div className={`col-12 mb-3 ${loggedIn && "col-lg-8"}`}>
          {/* If query is still being fetched show Loading... */}
          {/* Else render ThoughtList component and pass our list of Thought Documents as props */}
          {loading ? (
            <div>Loading...</div>
          ) : (
            <ThoughtList
              thoughts={thoughts}
              title="Some Feed for Thought(s)..."
            />
          )}
        </div>
        {/* If loggedIn is true and userData is true then render the FriendList component and pass down specific properties of userData */}
        {/* Else don't render anything */}
        {loggedIn && userData ? (
          <div className="col-12 col-lg-3 mb-3">
            <FriendList
              username={userData.me.username}
              friendCount={userData.me.friendCount}
              friends={userData.me.friends}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default Home;
