import * as Nedb from "nedb"
import { User } from "../Shared/Model";


 export class UserDbAccess{
    private nedb: Nedb;

    constructor(){
        this.nedb=new Nedb("database/Users.db")
        this.nedb.loadDatabase()
    }

    public async putUser(user: User):Promise<any>{
        return new Promise((resolve, reject) => {
            this.nedb.insert(user, (err: Error | null)=>{
                if (err) {
                    reject(err)
                } else {
                    resolve(user)
                }
            })
            
        })

    }
    public async getUserById(userId: string):Promise<User|undefined>{
        return new Promise((resolve, reject) => {
            this.nedb.find({ id: userId}, (err: Error,docs: any[] )=>{
                if (err) {
                    reject(err)
                } else {
                    if(docs.length==0){
                        resolve(undefined)
                    }else{
                        resolve(docs[0])
                    }
                }
            })
        })
    }
}