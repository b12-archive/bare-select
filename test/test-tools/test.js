import tape from 'tape-catch';

export default (partName) => {
  const test = (title, ...rest) => tape(`${partName}:  ${title}`, ...rest);
  Object.assign(test, tape);
  return test;
};
