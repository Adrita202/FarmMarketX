const db = require("./db");

const User = {
  // 🔐 Register User (Insert into users table)
  registerUser: ({ ph_no, role }, callback) => {
    const query = `
      INSERT INTO users (ph_no, role) 
      VALUES (?, ?)
    `;
    db.query(query, [ph_no, role], (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    });
  },

  // 🔐 Register Farmer (Insert into farmers table after users)
  registerFarmer: ({ user_id, name, address, pincode, aadhar_id, kishan_id }, callback) => {
    const query = `
      INSERT INTO farmers (user_id, name, address, pincode, aadhar_id, kishan_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [user_id, name, address, pincode, aadhar_id, kishan_id], (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    });
  },

  // 🔐 Register Wholesaler (Insert into wholesalers table after users)
  registerWholesaler: ({ user_id, name, address, pincode, aadhar_id, pan_num }, callback) => {
    const query = `
      INSERT INTO wholesalers (user_id, name, address, pincode, aadhar_id, pan_num)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [user_id, name, address, pincode, aadhar_id, pan_num], (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    });
  },

  // 📞 Get user by phone
  getUserByPhone: (ph_no, callback) => {
    const query = `SELECT * FROM users WHERE ph_no = ?`;
    db.query(query, [ph_no], (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  },

  // 🔐 OTP management
  saveOTP: (ph_no, otp_code, callback) => {
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 5);  // OTP expiration set to 5 minutes

    // Ensure your otps table has an expiration_time column (ALTER TABLE otps ADD COLUMN expiration_time TIMESTAMP)
    const query = `INSERT INTO otps (ph_no, otp_code, expiration_time) VALUES (?, ?, ?)`;
    db.query(query, [ph_no, otp_code, expirationTime], (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    });
  },

  getOTP: (ph_no, callback) => {
    const query = `SELECT * FROM otps WHERE ph_no = ? ORDER BY created_at DESC LIMIT 1`;
    db.query(query, [ph_no], (err, result) => {
      if (err) return callback(err);

      if (result.length) {
        const otp = result[0];
        const currentTime = new Date();

        if (otp.expiration_time && new Date(otp.expiration_time) < currentTime) {
          return callback(null, { expired: true }); // OTP has expired
        }

        return callback(null, otp); // Valid OTP
      }

      callback(null, null);  // No OTP found
    });
  },

  deleteOTP: (ph_no, callback) => {
    const query = `DELETE FROM otps WHERE ph_no = ?`;
    db.query(query, [ph_no], (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    });
  },

  // Get farmer details by user_id
  getFarmerDetails: (user_id, callback) => {
    const query = `SELECT * FROM farmers WHERE user_id = ?`;
    db.query(query, [user_id], (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    });
  },

  // Get wholesaler details by user_id
  getWholesalerDetails: (user_id, callback) => {
    const query = `SELECT * FROM wholesalers WHERE user_id = ?`;
    db.query(query, [user_id], (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    });
  }
};

module.exports = User;




// const db = require("./db");

// const User = {
//   // 🔐 Register User (Insert into users table)
//   registerUser: ({ ph_no, role }, callback) => {
//     const query = `
//       INSERT INTO users (ph_no, role) 
//       VALUES (?, ?)
//     `;
//     db.query(query, [userData.ph_no, userData.role], callback);
//   },

//   // 🔐 Register Farmer (Insert into farmers table after users)
//   registerFarmer: ({ user_id, name, address, pincode,aadhaarId, kishanId }, callback) => {
//     const query = `
//       INSERT INTO farmers (user_id, name, address, pincode,aadhaarId, kishan_id)
//       VALUES (?, ?, ?, ?, ?,?)
//     `;
//     db.query(query, [farmerData.user_id, farmerData.name, farmerData.address, farmerData.pincode,farmerData.aadhaarId, farmerData.kishanId], callback);
//   },

//   // 🔐 Register Wholesaler (Insert into wholesalers table after users)
//   registerWholesaler: ({ user_id, name, address, pincode, aadhaar_id }, callback) => {
//     const query = `
//       INSERT INTO wholesalers (user_id, name, address, pincode, aadhaar_id,pan_num)
//       VALUES (?, ?, ?, ?, ?,?)
//     `;
//     db.query(query, [wholesalerData.user_id, wholesalerData.name, wholesalerData.address, wholesalerData.pincode,wholesalerData.aadhaarId, wholesalerData.pan_num], callback);
//   },

//   // 📞 Get user by phone
//   getUserByPhone: (ph_no, callback) => {
//     const query = `SELECT * FROM users WHERE ph_no = ?`;
//     db.query(query, [ph_no], callback);
//   },

//   // 🔐 OTP management
//   saveOTP: (ph_no, otp, callback) => {
//     const expirationTime = new Date();
//   expirationTime.setMinutes(expirationTime.getMinutes() + 5);  
//     const query = `INSERT INTO otps (ph_no, otp_code) VALUES (?, ?)`;
//     db.query(query, [ph_no, otp], callback);
//   },

//   getOTP: (ph_no, callback) => {
//     const query = `SELECT * FROM otps WHERE ph_no = ? ORDER BY created_at DESC LIMIT 1`;
//     db.query(query, [ph_no], (err, result) => {
//       if (err) return callback(err);
  
//       if (result.length) {
//         const otp = result[0];
//         const currentTime = new Date();
        
//         if (new Date(otp.expiration_time) < currentTime) {
//           return callback(null, { expired: true }); // OTP has expired
//         }
  
//         return callback(null, otp); // Valid OTP
//       }
  
//       callback(null, null);  // No OTP found
//     });
//   },

//   deleteOTP: (ph_no, callback) => {
//     const query = `DELETE FROM otps WHERE ph_no = ?`;
//     db.query(query, [ph_no], callback);
//   },
//   // Get User by Phone Number
//   exports.getUserByPhone = (ph_no, callback) => {
//   const query = "SELECT * FROM users WHERE ph_no = ?";
//   db.query(query, [ph_no], callback);
// },


//   // Get farmer details by user_id
//   getFarmerDetails: (user_id, callback) => {
//     const query = `SELECT * FROM farmers WHERE user_id = ?`;
//     db.query(query, [user_id], callback);
//   },

//   // Get wholesaler details by user_id
//   getWholesalerDetails: (user_id, callback) => {
//     const query = `SELECT * FROM wholesalers WHERE user_id = ?`;
//     db.query(query, [user_id], callback);
//   },
//   saveOTP: (ph_no, otp, callback) => {
//     const query = `INSERT INTO otps (ph_no, otp_code) VALUES (?, ?)`;
//     db.query(query, [ph_no, otp], (err, result) => {
//       if (err) {
//         console.log("Error in saving OTP:", err);  // Log error
//         return callback(err);
//       }
//       console.log(`OTP saved for ${ph_no}`);  // Debugging step
//       callback(null, result);
//     });
//   }
  
// };

// module.exports = User;
