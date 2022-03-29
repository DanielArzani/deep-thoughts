import React from "react";
import { useParams } from "react-router-dom";

import ReactionList from "../components/ReactionList";
import ReactionForm from "../components/ReactionForm";

import Auth from "../utils/auth";
import { useQuery } from "@apollo/client";
import { QUERY_THOUGHT } from "../utils/queries";

const SingleThought = (props) => {
  // When a thought or reaction is clicked on a new component will be rendered and will have the param :id which we are giving the alias thoughtId
  const { id: thoughtId } = useParams();

  // We are querying a Thought document by the thoughtId
  const { loading, data } = useQuery(QUERY_THOUGHT, {
    variables: { id: thoughtId },
  });

  // When the thought finishes loading save it to the thought variable
  const thought = data?.thought || {};

  // What is rendered while waiting for thought to load
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="card mb-3">
        <p className="card-header">
          <span style={{ fontWeight: 700 }} className="text-light">
            {thought.username}
          </span>{" "}
          thought on {thought.createdAt}
        </p>
        <div className="card-body">
          <p>{thought.thoughtText}</p>
        </div>
      </div>

      {thought.reactionCount > 0 && (
        <ReactionList reactions={thought.reactions} />
      )}

      {Auth.loggedIn() && <ReactionForm thoughtId={thought._id} />}
    </div>
  );
};

export default SingleThought;
