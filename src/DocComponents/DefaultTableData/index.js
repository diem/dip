import React from 'react';

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

  return child.split(' ').map((word, index) => {
    const wordWithSpace = index === 0 ? word : ' ' + word;

    return word.length > 25
      ? <span className="break-word" key={index}>{wordWithSpace}</span>
      : wordWithSpace;
  });
}

const DefaultTableData = props => {
  return <td {...props}>{getChildren(props.children)}</td>;
};

export default DefaultTableData;
