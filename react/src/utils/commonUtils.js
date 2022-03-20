import React from 'react';

export const unique = (array, compareFunction = undefined) => {
  if (!compareFunction) {
    return Array.from(new Set(array));
  }
  return array.filter((v, i) => array.findIndex((v2) => compareFunction(v, v2)) === i);
};

export const formatNewlineToBr = (content) => {
  const contentLines = content.split('\n');
  return contentLines
    .map((l, i) => ({
      key: i,
      content: l,
    })) // Workaround key error
    .map((l, i) =>
      i === contentLines.length - 1 ? (
        <React.Fragment key={l.key}>{l.content}</React.Fragment>
      ) : (
        <React.Fragment key={l.key}>
          {l.content}
          <br />
        </React.Fragment>
      ),
    );
};
