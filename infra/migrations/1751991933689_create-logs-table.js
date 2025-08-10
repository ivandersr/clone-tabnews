exports.up = (pgm) => {
  pgm.createTable("logs", {
    id: "id",
    content: { type: "json", notNull: true },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("logs");
};
