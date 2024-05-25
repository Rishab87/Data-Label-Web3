import { getPendingTasks, renewTask } from "./apiFunctions/task"

const url = 'http://localhost:5000/api/v1'

export const authEndpoints = {
    userSignin: `${url}/auth/userSignin`,
    workerSignin: `${url}/auth/workerSignin`
}

export const taskEndpoints = {
    createTask: `${url}/task/createTask`,
    getTasks: `${url}/task/getTasks`,
    getPendingTasks: `${url}/task/pendingTask`,
    reviewTask: `${url}/task/reviewTask` , 
    decPendingAmount: `${url}/task/decrementAmount`,
    lockAmount: `${url}/task/lockAmount`,
    failedTask: `${url}/task/failedTask`,
    renewTask: `${url}/task/renewTask`
}