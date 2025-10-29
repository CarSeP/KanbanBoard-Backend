export const generateId = (length: number) => {
  const characters =
    "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890";
  let id = "";
  for (let i = 0; i < length; i++) {
    const random = Math.floor(Math.random() * characters.length);
    id += characters[random];
  }
  return id;
};
