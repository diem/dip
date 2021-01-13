import React from 'react';
import classnames from 'classnames';

const getChildren = (child, index = 0) => {
  if (child === undefined) {
    return child;
  } else if (Array.isArray(child)) {
    return child.map(getChildren);
  } else if (typeof child === 'object') {
    return React.cloneElement(child, {
      children: getChildren(child.props.children),
      key: index,
    });
  }

  return child.split(" ").map((word, index) => {
    const wordWithSpace = index === 0 ? word : " " + word;
    const classes = classnames({
      "break-word": word.length > 25,
      "break-word-mobile": word.length > 17,
    });

    return classes.length ? (
      <span className={classes} key={index}>
        {wordWithSpace}
      </span>
    ) : (
      wordWithSpace
    );
  });
};

const DefaultTableData = (props) => {
  return <td {...props}>{getChildren(props.children)}</td>;
};

export default DefaultTableData;
