import { Account, SessionToken, TokenGenerator, TokenRights, TokenState, TokenValidator } from "../Server/Model";
import { SessionTokenDbAccess } from "./SessionTokenDbAccess";
import { UserCredentialsDBAccess } from "./UserCredentialsDBAccess";

export class Autorizer implements TokenGenerator, TokenValidator{

    private userCredDbAccess: UserCredentialsDBAccess= new UserCredentialsDBAccess();

    private sessionTokenDbAccess: SessionTokenDbAccess=new SessionTokenDbAccess();

   async generateToken(account: Account): Promise<SessionToken | undefined> {
    const resultAccount=await this.userCredDbAccess.getUserCredential(account.username, account.password)
    
    if(resultAccount){
          const  token: SessionToken={
            accessRights: resultAccount.accessRights,
            expirationTime: this.generateExpirationTime(),
            username: resultAccount.username,
            valid:true,
            tokenId: this.generateRandomTokenId()
        }
        await this.sessionTokenDbAccess.storeSessionToken(token)
        return token
       }else{
        return undefined
       }
    }
    public async validateToken(tokenId:string):Promise<TokenRights>{
      const token= await this.sessionTokenDbAccess.getToken(tokenId)
      if(!token || !token.valid){
        return{
          accessRights:[],
          state: TokenState.INVALID
        }
      }else if(token.expirationTime<new Date()){
        return{
          accessRights:[],
          state: TokenState.EXPIRED
        }
      }return{
          accessRights: token.accessRights,
          state: TokenState.VALID
        }
    }

   private generateExpirationTime(){
    return new Date(Date.now()+ 60*60*1000)
   }
   private generateRandomTokenId(){
    return Math.random().toString(10).slice(2)
   }
}