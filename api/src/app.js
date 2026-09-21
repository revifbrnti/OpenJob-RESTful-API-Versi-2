require("dotenv").config();
const express = require("express");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const companyRoutes = require("./routes/companyRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const profileRoutes = require("./routes/profileRoutes");
const documentRoutes = require("./routes/documentRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "OpenJob API V1 is running",
  });
});

app.use("/authentications", authRoutes);
app.use("/users", userRoutes);
app.use("/companies", companyRoutes);
app.use("/categories", categoryRoutes);
app.use("/jobs", jobRoutes);
app.use("/applications", applicationRoutes);
app.use("/bookmarks", bookmarkRoutes);
app.use("/profile", profileRoutes);
app.use("/documents", documentRoutes);

app.use(errorMiddleware);

module.exports = app;
