export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp.toMillis ? timestamp.toMillis() : timestamp);
  return `${date.toLocaleDateString()}        ${date.toLocaleTimeString()}`;
};

export const generateKey = () => {
  return Math.random().toString(36).substr(2, 10);
};

export const sortMessagesByTimestamp = (messages) => {
  return messages.sort(
    (a, b) => {
      const timestampA = a.timestamp.toMillis ? a.timestamp.toMillis() : new Date(a.timestamp).getTime();
      const timestampB = b.timestamp.toMillis ? b.timestamp.toMillis() : new Date(b.timestamp).getTime();
      return timestampA - timestampB;
    }
  );
};