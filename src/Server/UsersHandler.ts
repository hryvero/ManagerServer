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
            default:
                this.handleNotFound()
                break;
        }
    }
    private async handlePut(){
        const operationAutorized= await this.operationAutorized(AccessRight.CREATE)
        if(operationAutorized){
            const user: User= await this.getRequestBody();
            await this.userDbAccess.putUser(user)
            this.respondText(HTTP_CODES.CREATED, `user ${user.name} is updated`)
        }else{
            this.respondBadRequest("bad req")
        }
    }
    private async handleGet() {
        const operationAutorized= await this.operationAutorized(AccessRight.READ)
        if(operationAutorized){
                    const parsedUrl=Utils.getUrlParameters(this.req.url);
        if (parsedUrl) {
            const userId = parsedUrl.query.id
            if (userId) {
                const user = await this.userDbAccess.getUserById(userId as string);
                console.log(user)
                if (user) {
                    this.respondJsonObject(HTTP_CODES.OK, user);
                } else {
                    this.handleNotFound();
                }
            } else {
                this.respondBadRequest('userId not present in request');
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