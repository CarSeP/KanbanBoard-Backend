export const getCors = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    origin: isProduction ? process.env.FRONTEND_URL : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
  };
};
