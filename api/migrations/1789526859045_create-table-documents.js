exports.up = (pgm) => {
  pgm.createTable("documents", {
    id: { type: "VARCHAR(50)", primaryKey: true },
    user_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    filename: { type: "TEXT", notNull: true },
    original_name: { type: "TEXT", notNull: true },
    mime_type: { type: "VARCHAR(100)", notNull: true },
    size: { type: "INTEGER", notNull: true },
    created_at: {
      type: "TIMESTAMP",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("documents");
};
