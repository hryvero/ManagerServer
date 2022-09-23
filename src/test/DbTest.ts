import { UserCredentialsDBAccess } from "../Autorization/UserCredentialsDBAccess";
import { UserDbAccess } from "../User/UserDbAccess";



export class DbTest{
    public dbAccess: UserCredentialsDBAccess= new UserCredentialsDBAccess()
    public userDbAcces: UserDbAccess= new UserDbAccess()
}
new DbTest().dbAccess.putUserCredential({
    username: "user1",
    password: "password1",
    accessRights: [0,1,2,3]
})

// new DbTest().userDbAcces.putUser({
//     age: 18,
//     id: "someStingId",
//     email: "grigorivvveronika@gmail.ua",
//     workingPosition: 3,
//     name: "Nika",
    

// })