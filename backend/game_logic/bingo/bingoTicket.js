
export function isValidSingleRow(rowLayout) {
  if (!rowLayout || rowLayout.length !== 9) return false;
  if (rowLayout.filter(Boolean).length !== 5) return false;
  for (let i = 0; i < rowLayout.length - 1; i++) {
    if (rowLayout[i] && rowLayout[i + 1]) return false;
  }
  return true;
}

export function isValidDoubleRow(rowLayout) {
  if (!rowLayout || rowLayout.length !== 9) return false;
  if (rowLayout.filter(Boolean).length !== 5) return false;
  let consecutivePairs = 0;
  let consecutiveTriples = 0;
  for (let i = 0; i < rowLayout.length; i++) {
    if (rowLayout[i] && rowLayout[i + 1] && rowLayout[i + 2]) {
      consecutiveTriples++;
    }
    if (
      rowLayout[i] &&
      rowLayout[i + 1] &&
      (i + 2 >= rowLayout.length || !rowLayout[i + 2])
    ) {
      if (!(i > 0 && rowLayout[i - 1])) {
        consecutivePairs++;
      }
    }
  }
  return consecutiveTriples === 0 && consecutivePairs === 1;
}