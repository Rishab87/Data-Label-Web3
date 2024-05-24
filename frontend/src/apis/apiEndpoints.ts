const url = 'http://localhost:5000/api/v1'

export const authEndpoints = {
    userSignin: `${url}/auth/userSignin`,
    workerSignin: `${url}/auth/workerSignin`
}

export const taskEndpoints = {
    createTask: `${url}/task/createTask`,
    getTasks: `${url}/task/getTasks`,
}