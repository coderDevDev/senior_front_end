import { credential } from "firebase-admin";
import { getApps, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { environmentConfig } from "./load-envs.config";

// const app = getApps().length === 0 ? initializeApp({
//   credential: applicationDefault(),
//   storageBucket: environmentConfig.FIREBASE_STORAGE_BUCKET as string
// }) : getApps()[0]

const app =
  getApps().length === 0
    ? initializeApp({
        credential: credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
        storageBucket: environmentConfig.FIREBASE_STORAGE_BUCKET as string,
      })
    : getApps()[0];

export const bucket = getStorage(app).bucket();

export default { bucket };
