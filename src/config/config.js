const config = {
  development: {
    backendUrl: "http://localhost:5000",
  },
  production: {
    backendUrl: "https://bharatx-events.onrender.com",
  },
};

export default process.env.NODE_ENV === "production" ? config.production : config.development;