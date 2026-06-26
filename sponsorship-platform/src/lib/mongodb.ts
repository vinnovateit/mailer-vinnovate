import mongoose from 'mongoose';
const MONGODB_URL=process.env.MONGODB_URL!;
if(!MONGODB_URL){
    throw new Error('Please define the MONGODB_URL environment variable inside .env.local');
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached = (global as any).mongoose; //checks if a database connection is there to prevent HMR
if (!cached){
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cached= (global as any).mongoose = {conn: null, promise: null};
}
async function connectToDatabase(){
    if(cached.conn){
        return cached.conn;
    }
    if(!cached.promise){
        const opts = {bufferCommands: false,};
        cached.promise=mongoose.connect(MONGODB_URL, opts).then((mongoose)=> {return mongoose;});
    }
    try {
        cached.conn = await cached.promise;
    } catch(e){
        cached.promise=null;
        throw e;
    }
    return cached.conn;
}
export default connectToDatabase;