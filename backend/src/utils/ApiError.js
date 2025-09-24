class ApiError extends Error{
    constructor(statusCode=500, message="Something went wrong", stack=null){
        super(message);
        
        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        if(stack){
            this.stack = stack;
        }else{
            this.stack = Error.captureStackTrace(this, this.constructor);// ref was storing in stack this creates a problem as sstaack is not being set
        }
    }
}

export {ApiError};// error donot give message in response