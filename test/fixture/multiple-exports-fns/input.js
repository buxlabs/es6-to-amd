function hash(str) {
  return "1" + str + "1";
}

export function guid() {
  return hash("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx");
}
