import React from 'react';

const Author = ({index, title, username}) => {
  const formattedTitle = `${index > 0 ? ', ' : ''}${title}`;

  if (!username) {
    return formattedTitle;
  }

  return (
    <a
      href={`https://github.com/${username}`}
      target="_blank"
    >
      {formattedTitle}
    </a>
  );
};

export default Author;
