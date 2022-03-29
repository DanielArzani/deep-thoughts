import React, { useState } from "react";

// useMutation is the primary way of executing mutations
import { useMutation } from "@apollo/client";
import { ADD_THOUGHT } from "../../utils/mutations";
import { QUERY_THOUGHTS, QUERY_ME } from "../../utils/queries";

const ThoughtForm = () => {
  // State for our form
  const [thoughtText, setText] = useState("");
  // State for our character count limit
  const [characterCount, setCharacterCount] = useState(0);

  // useMutation isn't automatically called like useQuery
  // addThought is our mutation function, we will call it when we want to use it
  // useMutation also gets error, data and loading options
  const [addThought, { error }] = useMutation(ADD_THOUGHT, {
    // Because the data that has been updated isn't automatically added to the proper fields (a new toDo isn't automatically added to the todoList unless the page is refreshed), to fix this we can call the update function
    update(cache, { data: { addThought } }) {
      try {
        // update thought array's cache
        // could potentially not exist yet, so wrap in a try/catch
        const { thoughts } = cache.readQuery({ query: QUERY_THOUGHTS });
        cache.writeQuery({
          // will check cache and return object that matches all of the query's fields else will return null
          query: QUERY_THOUGHTS,
          data: { thoughts: [addThought, ...thoughts] },
        });
      } catch (e) {
        console.error(e);
      }

      // update me object's cache
      const { me } = cache.readQuery({ query: QUERY_ME });
      cache.writeQuery({
        // writes data straight into cache
        query: QUERY_ME,
        data: { me: { ...me, thoughts: [...me.thoughts, addThought] } },
      });
    },
  });

  // update state based on form input changes
  const handleChange = (event) => {
    // The state of the input field (and char count) will only be able to change while the character count is less than or equal to 280
    if (event.target.value.length <= 280) {
      setText(event.target.value);
      setCharacterCount(event.target.value.length);
    }
  };

  // submit form
  const handleFormSubmit = async (event) => {
    // Prevents page from reloading
    event.preventDefault();

    try {
      // Calling mutation function
      // variables are what is required for the mutation (the arguments) to work
      // I believe username is coming from the context so its not needed here
      // A new thought is being created using what ever was submitted from the form
      await addThought({
        variables: { thoughtText },
      });

      // clear form value and set char count back to 0
      setText("");
      setCharacterCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      {/* If char count reaches 280 or there is an error add text-error class */}
      {/* As long as one of the 2 options are true then error will become true and the message "something went wrong will display" */}
      <p
        className={`m-0 ${characterCount === 280 || error ? "text-error" : ""}`}
      >
        Character Count: {characterCount}/280
        {error && <span className="ml-2">Something went wrong...</span>}
      </p>
      <form
        className="flex-row justify-center justify-space-between-md align-stretch"
        onSubmit={handleFormSubmit}
      >
        <textarea
          placeholder="Here's a new thought..."
          value={thoughtText}
          className="form-input col-12 col-md-9"
          onChange={handleChange}
        ></textarea>
        <button className="btn col-12 col-md-3" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default ThoughtForm;
