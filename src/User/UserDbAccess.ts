import * as Nedb from "nedb"
import { isArrayBufferView } from "util/types";
import { User } from "../Shared/Model";


 export class UserDbAccess{
    private nedb: Nedb;

    constructor(){
        this.nedb=new Nedb("database/Users.db")
        this.nedb.loadDatabase()
    }

    public async putUser(user: User):Promise<any>{
        if (!user.id) {
            user.id = this.generateUserId();
        }
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

    private generateUserId() {
        return Math.random().toString(36).slice(2);
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



    public async getUserByName(name: string):Promise<User[]>{
        const regEx=new RegExp(name)
        return new Promise((resolve, reject) => {
            this.nedb.find({ name: regEx}, (err: Error,docs: any[] )=>{
                if (err) {
                    reject(err)
                } else {
                    resolve(docs)
                }
            })
        })
    }
    public async deleteUser(userId: string):Promise<boolean>{
        const operationSuccess= await this.deleteUserById(userId);
        this.nedb.loadDatabase();
        return operationSuccess
    }

    public async deleteUserById(userId: string):Promise<boolean>{
        return new Promise((resolve, reject) => {
            this.nedb.remove({ id: userId}, (err: Error|null,numRemoved:number )=>{
                if (err) {
                    reject(err)
                } else {
                    if(numRemoved==0){
                        resolve(false)
                    }else{
                        resolve(true)
                    }
                }
            })
        })
    }
}