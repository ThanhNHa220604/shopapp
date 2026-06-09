// helpers/imageHelper.js

import os from "os";

export const getAvatarURL = (imageName) => {
  // nếu không có avatar
  if (!imageName) {
    return null;
  }

  // nếu đã là full url rồi
  if (imageName.includes("http")) {
    return imageName;
  }

  // local server
  const API_PREFIX = `http://${os.hostname()}:${process.env.PORT || 3000}/api`;

  return `${API_PREFIX}/images/${imageName}`;
};
