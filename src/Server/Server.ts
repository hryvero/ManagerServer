import {createServer, IncomingMessage, ServerResponse} from "http"

import { Utils } from "./Utils"
import { LoginHandler } from "./LoginHandler"
import { Autorizer } from "../Autorization/Autorizer";
import { UsersHandler } from "./UsersHandler";


export  class Server{

    private autorizer: Autorizer = new Autorizer();

   public createServer(){
        createServer(
        

            async (req: IncomingMessage, res: ServerResponse)=>{
            console.log("got request from" + req.url)
            const basePath=Utils.getUrlBasePath(req.url)
                switch(basePath){
                    case 'login':
                    await new LoginHandler(req,res, this.autorizer).handleRequest();
                        break;
                        case 'users':
                        await new UsersHandler(req,res, this.autorizer).handleRequest()
                                break;
                        default:
                            break;
                }
            
            res.end()
        }).listen(8080)
        console.log("server stared")
    }
}