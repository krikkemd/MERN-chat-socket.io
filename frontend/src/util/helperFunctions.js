export const firstCharUpperCase = string => string.slice(0, 1)[0].toUpperCase() + string.slice(1);

function hasDuplicates(arr) {
  return arr.some(x => arr.indexOf(x) !== arr.lastIndexOf(x));
}

// Remove indexes
// let indexes = [0, 6, 8]
// function spliceUserIndexes(arr) {
//   let remove = indexes;
//   for (let i = remove.length - 1; i >= 0; i--) {
//     arr.splice(remove[i], 1);
//   }
// }
