import * as crypto from 'crypto';
import * as admin from 'firebase-admin';

export default class SyncManager{
    static db = admin.firestore();
    static async computeHash(jsonString:string){
        const hash = crypto.createHash('sha256').update(jsonString).digest('hex');
        // Store the hash in Firestore (or Realtime Database if needed)
        await this.db.collection('computedHashes').doc('locomotiveSystemsHash').set({
            hash: hash,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }

    static async compareHash(hash:string){
        const hashDoc = await this.db.collection('computedHashes').doc('locomotiveSystemsHash').get();
        if (hashDoc.exists) {
            const data = hashDoc.data();
            if(data?.hash !== undefined){
                return data.hash === hash;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }

    static async getHash(){
        const hashDoc = await this.db.collection('computedHashes').doc('locomotiveSystemsHash').get();
        if (hashDoc.exists) {
            const data = hashDoc.data();
            if(data?.hash !== undefined){
                return data.hash;
            }else{
                return "";
            }
        }else{
            return "";
        }
    }
}