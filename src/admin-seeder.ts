import bcrypt from "bcrypt";
import User from "./database/models/user-model";

const adminSeeder = async () => {
  try {
    const data = await User.findOne({ email: "ankitchau2061@gmail.com" });

    const hashedPassword = await bcrypt.hash("admin123", 10);

    if (!data) {
      await User.create({
        username: "Ankit Chaudhary",
        email: "ankitchau2061@gmail.com",
        password: hashedPassword,
        role: "admin",
        isVerified: true,
      });

      console.log("Admin created");
    } else {
      data.password = hashedPassword;
      data.isVerified = true;
      await data.save();

      console.log("Admin updated (verified + hashed password)");
    }
  } catch (error: any) {
    console.error("Seeder error:", error);
  }
};


export default adminSeeder;
