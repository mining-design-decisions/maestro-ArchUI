import React from 'react';

const Comments = ({ commentsString }) => {
    console.log(commentsString)
  // Convert the string to an array of comments
  let commentsArray;

  try {
    // Attempt to parse the JSON string
    // commentsString = commentsString.replace("'", '"').replaceAll("',", '",').replaceAll(", '",', "').replace("']",'"]')
    // commentsArray = JSON.parse(commentsString);

    commentsArray = JSON.parse(commentsString.replaceAll("'", '"'));
  } catch (error) {
    // If parsing fails, log the error and use the original string
    console.error("Error parsing JSON string:", error);
    // commentsArray = [commentsString];
    return (<>
    <div className="mb-4 p-4 bg-white rounded shadow text-black">
        {commentsString}
    </div>
    </>)
  }
//   const commentsArray = JSON.parse(commentsString.replaceAll("'", '"'));
  console.log(commentsArray)

  return (
    // <div className="p-4 bg-gray-200 text-black">
        <>
      {commentsArray.map((comment, index) => (
        <div key={index} className="mb-4 p-4 bg-white rounded shadow text-black">
            {comment}
          {comment.split('\n').map((line, lineIndex) => (
            <p key={lineIndex} className="mb-2">
              {line}
            </p>
          ))}
          {index < commentsArray.length - 1 && (
            <hr className="my-4 border-t border-gray-300" />
          )}
        </div>
      ))}
      </>
    // </div>
  );
};

export default Comments;