import React from "react";

// useQuery is a hook
import { useQuery } from "@apollo/client";

import { QUERY_THOUGHTS } from "../utils/queries";
import ThoughtList from "../components/ThoughtList";

const Home = () => {
  // use useQuery hook to make query request
  // can also take in error alongside loading and data
  // data -> an array of objects
  const { loading, data } = useQuery(QUERY_THOUGHTS);

  // the ? checks to make sure that data exists,it will return undefined if it doesn't
  // making it equal to an empty array will prevent an error from being thrown, react will update it from an empty array into one with the data once its done loading
  // we could probably use loading to deal with this
  const thoughts = data?.thoughts || [];
  // console.log(thoughts);

  return (
    <main>
      <div className="flex-row justify-space-between">
        <div className="col-12 mb-3">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <ThoughtList
              thoughts={thoughts}
              title="Some Feed for Thought(s)..."
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default Home;
