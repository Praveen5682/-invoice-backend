    const express = require("express");
    const gateway = require("./apigateway/gateway");
    require("dotenv").config();

    const app = express();
    app.use(express.json());

    // Register API gateway
    gateway(app);

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    });
