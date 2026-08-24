const mongoose = require("mongoose");
const colors = require("colors");
const dns = require("dns");

// Node's built-in resolver (c-ares) can fail to reach certain
// VPN/router-assigned DNS servers for SRV lookups (mongodb+srv://),
// even though the OS resolver handles them fine. Forcing public
// DNS servers here avoids "querySrv ECONNREFUSED" on connect.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1); // Exit with a non-zero status code to indicate an error
  }
};

module.exports = connectDB;

