exports.up = (pgm) => {
  pgm.createTable("applications", {
    id: { type: "VARCHAR(50)", primaryKey: true },
    user_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    job_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "jobs",
      onDelete: "CASCADE",
    },
    status: { type: "VARCHAR(20)", notNull: true, default: "pending" },
    created_at: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.addConstraint("applications", "unique_user_job_application", {
    unique: ["user_id", "job_id"],
  });
};

exports.down = (pgm) => {
  pgm.dropTable("applications");
};
