
export const reformatDate = (searchString) => {
  if (!searchString) {
    return null; 
  }
  const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
  const match = searchString.match(dateRegex);
  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`; 
  }
  return null; 
};
