const response = {
  value: {
    files: {
      FFCDPVXY:
        "b'\\xf9\\x9f\\xf8\\xe8;\\x89\\x8d\\xf1DI\\x81o\\\\\\x12\\xbd\\xe9\\xc5\\x96s-L\\x03(n\\x89\\xf6\\xc1\\x18\\x88\\x12\\x91\\x14g\\xf7\\xd9q\\x1b+\\x8c\\xd34\\x96\\xc6\\xb2a\\xcd\\xc3\\xe1(g5CN(\\xd0\\x06\\x8cQ\\x99K\\x9cJC~\\x0bu\\xdc\\x800\\x04\\x98-\\x0f\\xd8\\x16S\\xaft\\xe5?Y&\\xf3\\xce\\xfbh0\\x9b\\xc6\\xfd\\xf3\\xb1.\\x94t\\x85\\x8c\\xee\\x9f\\x92ZU\\xba,X`\\x90P\\r*M\\xd5\\xd5f\\x07\\x17\\x8f\\xde\\xca;\\xa8e\\x8e\\xaf=m\\xd8\\x9e\\xd4>v\\xd9\\x9d\\r\\x13:\\x88\\xba\\xa6\\x9az\\xe52\\x1b\\xd4:%^1\\x00\\xbb\\x01(\\xafx\\xe6\\xc08|\\xf5\\x04i\\xb6\\x1c\\x99\\xa7\\xe6\\r\\xc2yo\\xdb5rg\\x1b\\x9c1\\x9c\\x12\\xdb\\xfcT3*3\\x16\\xc3m\\x87\\x88\\x12\\r\\xbb\\xa2\\xb6a\\x1e\\x86\\x00v\\x15\\x00\\xd9>\\x84\\xc4\\xbbhG>\\xca\\x1c\\x00\\xa9\\xd3;\\xaf+\\xf0\\xc4H\\xd0\\x00\\xe4\\xea>\\x11\\x8a\\x89q\\x8f\\xd3P\\xcc_kZ\\xaa\\x04\\xa8\\xe2aAY\\xc5\\xea\\xcc\\xb4\\x8a\\x10[\\x0b\\xf3v E\\xf8\\xb17w\\'\\xb6j\\x9e:\\x9dV\\xcd\\x02u\\x8bb!\\xc4=\\x1fQ\\xd5X*\\x9bT\\x8a\\x863\\xcb\"w\\x01\\xc2$\\xa4\\x89n\\x9d\\xf4Qm\\xfc \\x16\\xdb\\x16\\xc4\\x97t5\\x1c2q\\x99\\xd1\\xd7\\x83\\xc0z9\\x04\\xe8\\r\\xdc\\x87\\x81G7w\\x03\\xab\\xcd3+\\\\G\\x10\\x178\\x97\\x11\\x15W\\x8e\\x92\\x81=s%\\x84\\x12D\\x14\\x8d\\r\\xd0\\xa3\\x851\\x03\\rt\\x04\\x07'",
    },
  },
};
const logFiles = response.value.map((logFile) => ({
  ...logFile,
  content: logFile.content.replace(/^b'|'$/g, ""), // Remove leading "b'" and trailing "'"
}));
console.log(logFiles);

if (Array.isArray(response.value)) {
  const logFiles = response.value.map((logFile) => ({
    ...logFile,
    content: logFile.content.replace(/^b'|'$/g, ""), // Remove leading "b'" and trailing "'"
  }));
} else if (typeof response.value === "object" && response.value !== null) {
  const logFiles = Object.keys(response.value).map((key) => ({
    name: key,
    content: response.value[key].replace(/^b'|'$/g, ""), // Remove leading "b'" and trailing "'"
  }));
  console.log(logFiles);
}
