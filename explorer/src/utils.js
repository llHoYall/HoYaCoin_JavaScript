export const makeDateSexy = seconds => {
  const date = new Date(null);
  date.setSeconds(seconds);
  return date.toUTCString();
};

export const stringToJSON = string => {
  try {
    return JSON.parse(string);
  } catch (e) {
    console.log(e);
  }
};

export const parseMessage = message => {
  if (typeof message.data === "string") {
    const { data } = message;
    const parsed_message = stringToJSON(data);
    if (parsed_message !== null) {
      const { type } = parsed_message;
      if (type === "BLOCKCHAIN_RSP") {
        return parsed_message.data;
      } else {
        return null;
      }
    }
  }
};
