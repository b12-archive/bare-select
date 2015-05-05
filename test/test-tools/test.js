import tape from 'tape-catch';

export default (partName) => {
  const test = (title, ...rest) => tape(`${partName}:  ${title}`, ...rest);
  Object.keys(tape).forEach((key) => test[key] = tape[key]);
  return test;
};
