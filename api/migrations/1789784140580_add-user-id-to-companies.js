exports.up = (pgm) => {
  pgm.addColumn("companies", {
    user_id: {
      type: "VARCHAR(50)",
      references: "users",
      onDelete: "CASCADE",
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn("companies", "user_id");
};
