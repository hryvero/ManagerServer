import { IncomingMessage, ServerResponse } from "http";
import { AccessRight, HTTP_CODES, HTTP_METHODS, User } from "../Shared/Model";
import { UserDbAccess } from "../User/UserDbAccess";
import { BaseRequestHandler } from "./BaseRequestHandler";
import { TokenValidator } from "./Model";
import { Utils } from "./Utils";


export class UsersHandler extends BaseRequestHandler{

    private userDbAccess: UserDbAccess=new UserDbAccess()
    private tokenValidator: TokenValidator;
  


    public constructor(req: IncomingMessage, res: ServerResponse,tokenValidator: TokenValidator) {
        super(req,res)
        this.tokenValidator=tokenValidator
    }

   public async handleRequest(): Promise<void>{
        switch (this.req.method) {
            case HTTP_METHODS.GET:
                await this.handleGet()
                break;
            case HTTP_METHODS.PUT:
                await this.handlePut()
                break;
            case HTTP_METHODS.DELETE:
                    await this.handleDelete()
                    break;
            default:
                this.handleNotFound()
                break;
        }
    }
    private async handleDelete(){
        const operationAutorized= await this.operationAutorized(AccessRight.DELETE)
        if(operationAutorized){
            const parsedUrl=Utils.getUrlParameters(this.req.url);
            if (parsedUrl) {
                if (parsedUrl.query.id){
                    const deleteResult= this.userDbAccess.deleteUser(parsedUrl.query.id as string)
                    if(await deleteResult){
                        this.respondText(HTTP_CODES.OK, `user ${parsedUrl.query.name} was deleted`)
                    }else{
                        this.respondText(HTTP_CODES.NOT_FOUND, `user ${parsedUrl.query.id} was NOT found`)
                    }
                }else {
                    this.respondBadRequest("missing or invalid ID")
                }
            }else{
                this.respondText(HTTP_CODES.BAD_REQUEST,"URL was not parsed")
            }
        }
    }
    private async handlePut(){
        const operationAutorized= await this.operationAutorized(AccessRight.CREATE)
        if(operationAutorized){
            try {
                const user: User = await this.getRequestBody();
                await this.userDbAccess.putUser(user);
                this.respondText(HTTP_CODES.CREATED, `user ${user.name} created`);
            } catch (error:Error|any) {
                this.respondBadRequest(error.message);
            }
        }else{
            this.respondBadRequest("missing or invalid token")
        }
    }



    private async handleGet() {
        const operationAutorized= await this.operationAutorized(AccessRight.READ)
        if(operationAutorized){
                    const parsedUrl=Utils.getUrlParameters(this.req.url);
        if (parsedUrl) {
            if (parsedUrl.query.id) {
                const user = await this.userDbAccess.getUserById(parsedUrl.query.id as string);
                    if (user) {
                        this.respondJsonObject(HTTP_CODES.OK, user);
                    } else {
                        this.handleNotFound();
                    }
            } else if(parsedUrl.query.name){
                const users = await this.userDbAccess.getUserByName(parsedUrl.query.name as string);
                this.respondJsonObject(HTTP_CODES.OK, users);
            }
            else {
                this.respondBadRequest('userId or name is not present in request');
            }

    }
        }else{
            this.respondUnatorized("missing or invalid token")
        }

    
    }
    private async operationAutorized(operation: AccessRight):Promise<boolean>{
        const tokenId=this.req.headers.authorization
        if (tokenId) {
            const tokenRights= await this.tokenValidator.validateToken(tokenId)
            if (tokenRights.accessRights.includes(operation)) {
                return true
            } else {
                return false
            }
        } else {
            return false
        }
    }
}