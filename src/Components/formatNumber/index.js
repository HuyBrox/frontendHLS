

export function formatNumber(num) {
  if (num == null || isNaN(num)) {
    return "0";
  }

  const absNum = Math.abs(num);
  let suffix = "";
  let formatted = absNum;

  if (absNum >= 1e9) {
    formatted = absNum / 1e9;
    suffix = "b";
  } else if (absNum >= 1e6) {
    formatted = absNum / 1e6;
    suffix = "m";
  } else if (absNum >= 1e3) {
    formatted = absNum / 1e3;
    suffix = "k";
  }

  const result = `${formatted.toFixed(1).replace(/\.0$/, "")}${suffix}`;
  return num < 0 ? `-${result}` : result;
}


export function formatNumberString(number) {
  if (number >= 1_000_000_000) {
    return (number / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'b';
  } else if (number >= 1_000_000) {
    return (number / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'm';
  } else if (number >= 1_000) {
    return (number / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return number.toString();
}

