exports.up = (pgm) => {
  pgm.createTable("logs", {
    id: "id",
    content: { type: "json", notNull: true },
    createdAt: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("logs");
};
