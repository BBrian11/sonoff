const ewelink = require("ewelink-api");

const connection = new ewelink({
  email: "betapharma123@gmail.com",
  password: "@Betapharma123",
  region: "us",
});

const getDevices = async () => {
  console.log(await connection.getDevices());
  return await connection.getDevices();
};

module.exports = { connection, getDevices };