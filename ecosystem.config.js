//start backend
module.exports = {
  apps: [
	{
	  name: "earlyaccess-backend",
	  script: "./backend/src/server.js",
	  env: {
		PORT: 3089,
		NODE_ENV: "development"
	  },
	  env_production: {
		PORT: 3089,
		NODE_ENV: "production"
	  }
	}
  ]
};