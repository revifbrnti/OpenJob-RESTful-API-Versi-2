exports.up = (pgm) => {
  pgm.createTable("jobs", {
    id: { type: "VARCHAR(50)", primaryKey: true },
    company_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "companies",
      onDelete: "CASCADE",
    },
    category_id: {
      type: "VARCHAR(50)",
      notNull: true,
      references: "categories",
      onDelete: "CASCADE",
    },
    title: { type: "VARCHAR(150)", notNull: true },
    description: { type: "TEXT", notNull: true },
    job_type: { type: "VARCHAR(50)" },
    experience_level: { type: "VARCHAR(50)" },
    location_type: { type: "VARCHAR(50)" },
    location_city: { type: "VARCHAR(100)" },
    salary_min: { type: "INTEGER" },
    salary_max: { type: "INTEGER" },
    is_salary_visible: { type: "BOOLEAN", notNull: true, default: true },
    status: { type: "VARCHAR(30)", notNull: true, default: "open" },
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
};

exports.down = (pgm) => {
  pgm.dropTable("jobs");
};
