import httpServer from "./config/socket-io-config.js";
import { config } from "./config/index.js";
import { DB } from "./db/index.js";

const PORT = config.port || 3000;

// console.log(process.env.NODE_TEST);
DB().then(()=>{
    httpServer.listen(PORT, ()=>{
        console.log(`Server is running at http://localhost:${PORT}`);    
    }).on("error", (error)=>{
        console.log(error);
    })
}).catch((error)=>{
    console.log(error);
})