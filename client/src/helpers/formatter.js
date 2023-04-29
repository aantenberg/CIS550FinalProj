export function formatDuration(sec) {
  const date = new Date(0);
  date.setSeconds(sec ?? 0);
  return date.toISOString().substring(14, 19);
}

export function formatReleaseDate(date) {
  const dateObj = new Date(Date.parse(date));
  return dateObj.toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function formatZipcode(zipcode) {
  const zipcodeStr = zipcode.toString();
  return zipcodeStr.padStart(5, "0")
}

export function dollarFormat(num) {
  return '$' + num.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}