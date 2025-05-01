const User = require("../Models/userModel");

// 1. Send OTP
exports.sendOtp = (req, res) => {
  const { ph_no } = req.body;

  // Validate input
  if (!ph_no) {
    return res.status(400).json({ message: "Phone number is required." });
  }
  console.log("Request body:", req.body);

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  console.log(`Generated OTP for ${ph_no}: ${otp}`);

  // Save OTP to the database
  User.saveOTP(ph_no, otp, (err) => {
    if (err) {
      console.error('Error saving OTP:', err);
      return res.status(500).json({ message: "Failed to save OTP." });
    }
    console.log(`OTP for ${ph_no}: ${otp}`);
    res.status(200).json({ message: "OTP sent successfully." });
  });
};

// 2. Register Farmer
exports.registerFarmer = (req, res) => {
  const { name, ph_no, address, pincode, aadharId, kishanId, otp } = req.body;

  if (!name || !ph_no || !address || !pincode || !aadharId || !kishanId || !otp) {
    return res.status(400).json({ message: "All fields including OTP are required." });
  }

  // Check if OTP matches the one in the database
  User.getOTP(ph_no, (err, result) => {
    if (err) {
      console.error('Error fetching OTP:', err);
      return res.status(500).json({ message: "Server error while verifying OTP." });
    }
    if (!result || result.expired || result.otp_code !== Number(otp)) {
      return res.status(401).json({ message: "Invalid or expired OTP." });
    }

    // Register user in the users table with role "farmer"
    User.registerUser({ ph_no, role: 'farmer' }, (err, userResult) => {
      if (err) {
        console.error('Error registering user:', err);
        return res.status(500).json({ message: "Error registering user." });
      }

      const userId = userResult.insertId; // Get the user ID from the inserted user

      // Register farmer details in the farmers table
      User.registerFarmer(
        { user_id: userId, name, address, pincode, aadhar_id: aadharId, kishan_id: kishanId },
        (err) => {
          if (err) {
            console.error('Error registering farmer:', err);
            return res.status(500).json({ message: "Error registering farmer." });
          }

          User.deleteOTP(ph_no, () => {});
          return res.status(200).json({ message: "Farmer registered successfully." });
        }
      );
    });
  });
};

// 3. Register Wholesaler
exports.registerWholesaler = (req, res) => {
  const { name, ph_no, address, pincode, aadhar_id, pan_num, otp } = req.body;

  if (!name || !ph_no || !address || !pincode || !aadhar_id || !pan_num || !otp) {
    return res.status(400).json({ message: "All fields including OTP are required." });
  }

  // Check if OTP matches the one in the database
  User.getOTP(ph_no, (err, result) => {
    if (err) {
      console.error('Error fetching OTP:', err);
      return res.status(500).json({ message: "Server error while verifying OTP." });
    }
    if (!result || result.expired || result.otp_code !== Number(otp)) {
      return res.status(401).json({ message: "Invalid or expired OTP." });
    }

    // Register user in the users table with role "wholesaler"
    User.registerUser({ ph_no, role: 'wholesaler' }, (err, userResult) => {
      if (err) {
        console.error('Error registering user:', err);
        return res.status(500).json({ message: "Error registering user." });
      }

      const userId = userResult.insertId; // Get the user ID from the inserted user

      // Register wholesaler details in the wholesalers table
      User.registerWholesaler(
        { user_id: userId, name, address, pincode, aadhar_id, pan_num },
        (err) => {
          if (err) {
            console.error('Error registering wholesaler:', err);
            return res.status(500).json({ message: "Error registering wholesaler." });
          }

          User.deleteOTP(ph_no, () => {});
          return res.status(200).json({ message: "Wholesaler registered successfully." });
        }
      );
    });
  });
};

// 4. Login
exports.login = (req, res) => {
  const { ph_no, otp } = req.body;

  if (!ph_no || !otp) {
    return res.status(400).json({ message: "Phone number and OTP are required." });
  }

  // Check if OTP matches the one in the database
  User.getOTP(ph_no, (err, result) => {
    if (err) {
      console.error('Error fetching OTP:', err);
      return res.status(500).json({ message: "Server error while verifying OTP." });
    }
    if (!result || result.expired || result.otp_code !== Number(otp)) {
      return res.status(401).json({ message: "Invalid or expired OTP." });
    }

    // Get user by phone number to determine their role
    User.getUserByPhone(ph_no, (err, user) => {
      if (err) {
        console.error('DB error fetching user:', err);
        return res.status(500).json({ message: "DB error." });
      }
      if (!user || user.length === 0) {
        return res.status(404).json({ message: "User not registered." });
      }

      const userRole = user[0].role;

      // Fetch additional details depending on user role
      if (userRole === 'farmer') {
        User.getFarmerDetails(user[0].id, (err, farmer) => {
          if (err) {
            console.error('Error fetching farmer details:', err);
            return res.status(500).json({ message: "Error fetching farmer details." });
          }
          User.deleteOTP(ph_no, () => {});
          return res.status(200).json({ message: "Login successful as Farmer.", user: farmer[0] });
        });
      } else if (userRole === 'wholesaler') {
        User.getWholesalerDetails(user[0].id, (err, wholesaler) => {
          if (err) {
            console.error('Error fetching wholesaler details:', err);
            return res.status(500).json({ message: "Error fetching wholesaler details." });
          }
          User.deleteOTP(ph_no, () => {});
          return res.status(200).json({ message: "Login successful as Wholesaler.", user: wholesaler[0] });
        });
      } else {
        return res.status(400).json({ message: "Unknown user role." });
      }
    });
  });
};


















// const User = require("../Models/userModel");

// // 1. Send OTP
// exports.sendOtp = (req, res) => {
//   const { ph_no } = req.body;
// // Check if phone number is provided
//   if (!ph_no) return res.status(400).send("Phone number is required.");

//   const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
//   console.log(`Generated OTP for ${ph_no}: ${otp}`);
//   //Save OTP to the database
//   User.saveOTP(ph_no, otp, (err) => {
//     console.log("Fetched OTP from DB:", result);
//     if (err) return res.status(500).send("Failed to save OTP.");
//     console.log(`OTP for ${ph_no}: ${otp}`);
//     res.status(200).send("OTP sent successfully.");
//   });
// };

// // 2. Register Farmer
// exports.registerFarmer = (req, res) => {
//   const { name, ph_no, address, pincode, kishanId, otp } = req.body;

//   User.getOTP(ph_no, (err, result) => {
//     console.log("Fetched OTP from DB:", result);
//     if (err || !result.length || result[0].otp_code !== otp) {
//       return res.status(401).send("Invalid OTP.");
//     }

//     // Register user in the users table with role "farmer"
//     User.registerUser({ ph_no, role: 'farmer' }, (err, userResult) => {
//       if (err) return res.status(500).send("Error registering user.");
      
//       const userId = userResult.insertId; // Assuming this is how your DB returns the inserted user ID

//       // Register farmer details in the farmers table
//       User.registerFarmer({ user_id: userId, name, address, pincode, kishanId }, (err) => {
//         if (err) return res.status(500).send("Error registering farmer.");
        
//         User.deleteOTP(ph_no, () => {});
//         return res.status(200).send("Farmer registered successfully.");
//       });
//     });
//   });
// };

// // 3. Register Wholesaler
// exports.registerWholesaler = (req, res) => {
//   const { name, ph_no, address, pincode, aadhaarId, otp } = req.body;

//   User.getOTP(ph_no, (err, result) => {
//     if (err || !result.length || result[0].otp_code !== otp) {
//       return res.status(401).send("Invalid OTP.");
//     }

//     // Register user in the users table with role "wholesaler"
//     User.registerUser({ ph_no, role: 'wholesaler' }, (err, userResult) => {
//       if (err) return res.status(500).send("Error registering user.");
      
//       const userId = userResult.insertId; // Assuming this is how your DB returns the inserted user ID

//       // Register wholesaler details in the wholesalers table
//       User.registerWholesaler({ user_id: userId, name, address, pincode, aadhaarId }, (err) => {
//         if (err) return res.status(500).send("Error registering wholesaler.");
        
//         User.deleteOTP(ph_no, () => {});
//         return res.status(200).send("Wholesaler registered successfully.");
//       });
//     });
//   });
// };

// // 4. Login
// exports.login = (req, res) => {
//   const { ph_no, otp } = req.body;

//   User.getOTP(ph_no, (err, result) => {
//     if (err || !result.length || result[0].otp_code !== otp) {
//       return res.status(401).send("Invalid OTP.");
//     }

//     // Get the user by phone number to determine role
//     User.getUserByPhone(ph_no, (err, user) => {
//       if (err) return res.status(500).send("DB error.");
//       if (!user.length) return res.status(404).send("User not registered.");

//       const userRole = user[0].role;
      
//       // Depending on the role, fetch additional details from the relevant table
//       if (userRole === 'farmer') {
//         User.getFarmerDetails(user[0].id, (err, farmer) => {
//           if (err) return res.status(500).send("Error fetching farmer details.");
//           User.deleteOTP(ph_no, () => {});
//           return res.status(200).send("Login successful as Farmer.");
//         });
//       } else if (userRole === 'wholesaler') {
//         User.getWholesalerDetails(user[0].id, (err, wholesaler) => {
//           if (err) return res.status(500).send("Error fetching wholesaler details.");
//           User.deleteOTP(ph_no, () => {});
//           return res.status(200).send("Login successful as Wholesaler.");
//         });
//       }
//     });
//   });
// };
