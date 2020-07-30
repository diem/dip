const authorRegex = /@\w+/g;

export const parseAuthors = authors =>
  authors
    .split(',')
    .map(author => {
      let username;

      if (author.match(authorRegex)) {
        username = author.match(authorRegex)[0].substring(1);
      } else if (!author.includes(' ')) {
        username = author;
      }

      return {
        title: author,
        username,
      };
    });

export const toTitleCase = str =>
  str.split(' ').map(w => `${w[0].toUpperCase()}${w.substring(1)}`).join('');
