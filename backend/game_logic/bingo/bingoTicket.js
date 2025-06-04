
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

  let consecutiveNumbers = 0;
  let pairCount = 0; 

  for (let i = 0; i < rowLayout.length; i++) {
    if (rowLayout[i]) {
      consecutiveNumbers++;
    } else {
      if (consecutiveNumbers === 2) {
        pairCount++;
      } else if (consecutiveNumbers > 2) {
  
        return false;
      }
      consecutiveNumbers = 0;
    }
  }

  if (consecutiveNumbers === 2) {
    pairCount++;
  } else if (consecutiveNumbers > 2) {
    return false;
  }
  
  return pairCount === 1; // Exactly one pair of consecutive numbers
}
