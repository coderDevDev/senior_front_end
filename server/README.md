## API Reference

Base API = /api/v1/

### Get all users

| Parameter | Type     | Method  |
| :-------- | :------- | :------ |
| `/user/`  | `string` | **GET** |

#### Success Response

```
{
    "statusCode": 200,
    "data": {
        "totalDocs": 3,
        "totalPages": 1,
        "lastPage": 1,
        "count": 3,
        "currentPage": {
            "page": 1,
            "limit": 20
        },
        "users": [...]
    },
    "message": "Successfully found users"
}

```

#### Error Response

```
{
    "data": null,
    "statusCode": 500,
    "status": "[ServerError]: Internal Server Error.",
    "message": "Error messsage here"
}

```

#### User Filters (_Sort_, _Page_, _Search_, _Limit_)

| Parameter                    | Type     | Method  |
| :--------------------------- | :------- | :------ |
| `/user?limit={number}`       | `string` | **GET** |
| `/user?page={number}`        | `string` | **GET** |
|                              |
| `/user?sort={column_name}`   | `string` | **GET** |
|                              |
| `/user?search={column_name}` | `string` | **GET** |

|

### Create User

```http
  POST /api/user/add_user/
```

#### Success Response

```
{
    "statusCode": 200,
    "data": {...},
    "message": "User has been added."
}
```

#### Error Response

```
{
    "data": null,
    "statusCode": 500,
    "status": "[ServerError]: Internal Server Error.",
    "message": "An unexpected error occured"
}
```

#### Error with validation

- Applied to validate the request body before passing it to the controller

_Validation Rules_

(Working in progress)

#### Here are the routes for the senior citizen API:

```
GET /api/v1/senior — Retrieve all senior citizens.
POST /api/v1/senior — Create a new senior citizen.
PUT /api/v1/senior/:id — Update an existing senior citizen by ID.
DELETE /api/v1/senior/:id — Delete a senior citizen by ID.

```

## Environment Variables

To run this server, you will need to add the following environment variables to your .env.development file

**_Copy niyo nalang to, since naka private repo naman tayo_**

```sh
SUPABASE_API_KEYS=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaXRkbXRhYWtsYXR3Z3Zudmt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTI1ODU4NCwiZXhwIjoyMDQ0ODM0NTg0fQ.J7bcGiLqNC6BX6iLAMQK0fEdXyl0h5nl7l6TMpBCCF4
SUPABASE_URL=https://yaitdmtaaklatwgvnvku.supabase.co

# admin key
FIREBASE_PROJECT_ID=senior-citizen-booklet
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-1i46r@senior-citizen-booklet.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDDsFRRuahIo1Ih\nq2enpfBF67wYvoudKwWnH96LPY75TY01MNzz/GSzZtWesrfLqN8+NAS4nUk9bj1G\naqIBMgQ7rFN7YyFw+zSx5SnF6fpdCYyAOT9XzBXZneIAN8Fgh+25yu+zgUqcHQbx\n0xiYeKnQz2067bMLGoWDAa1A6fseOuEEnBspZ3BdwmOXeWVbaA31nDXnvBbgiEjJ\nO1ptzikJpe57WYoR6TG7DWlW5rlTKrRPY3kWndkve/kpAHG4/kg9vHphN1Y37IDK\nOb960x6B28xuwLT9bJH1Htg8+RtTlYyxTrQZ+inM5+8vUB3+BVYljCGSvPLm9sSC\nlQPzRMoJAgMBAAECggEAAVe5YbeAucGHyRFbAbciwegPKgBMsZm09+OWbFAne1Br\n5/HbjOpYv95fGC/+Zi2qHSF66CVey5wbsYWpHOb8nnLdPnB8r0DEqMp7ZznmwjKp\nkyD8F/HKM0G2ZkKmV1o3aFnwcRkxq4aLdfyjzjqtt5q6E3hut7nJMWVBN2Z47Ekq\nDKP4JvlzI8lVrQBzJnKn9ecb273a6Etaoe7Oun+g3he793rIsQlZU9deCQ8tr3GN\n3/nFacemeOce5gs9I4AV9YpKi+dHAnRAw6/voq+AuSGzFKFxXb85GXo8Uer15PDw\nuCPq6UA/u1IQ9bL/10zCdEZS+kniWFQvPt9LBt1ZzQKBgQD2/QjhXxMCUK8o7em6\nXJaeMtoMecAKeZFYNv7qTZhS5pWzM0mhTFdzqexuwxlNnz7d5f0g62JPx2pmhg5X\nkVeU1WJPCHes39bxqYSGJ8icgotrR3Acx29ScJmUqPx4q6wxXvXeVldijcMOwrjF\ne3CtYzx8jnU4wqN4twfUrOkd9wKBgQDK1CL/8UT+VOrsqj+wLWwOeFQ7KdSWFxy+\n4L18GMu8fKv/wvxD9rJdjivdrd50pb3r7wJ+YObBdBDtQMGbWN0X0bjQtyosDxAf\nAfIlbJTOrszwDWXZw2mBKKu2fdBWC3H+qvyT0WXfNoeWW4j+xKiJDEIG+AYV3pFn\nR4tYLOdX/wKBgEmFAIO1fT8PLVSNnSkwLlVg5a8Y/qUfkrgjhrXP6yuiH6V7+src\nopt3VT2TLZEBegErWLHX3yfIQE/MT7CZPuy6p8zGxHjdGGpO/3e/l+OeqEmCtkia\nxPRROCYcNyrkTxlTHvTT1qcrc4iNRdri56N1Cqg474O5zFc+hEI2Rh35AoGALlVV\nhXgdFahaXiPqFpnZtFiCjV1Z5ctz0prOTlnvuKgWNn/ZVsE1L6/5j1NXnPf7sbjQ\nrgP+0rRr5XbEg3NCVl2fRXaCGLx8J0kvgqMSP0CpKjE1UhCUul+LEk4dWHqW2OFA\nf5f3GI2BXbSdT+2mvl/heWwRH8/PEXPDfioL0wsCgYA6YLdAN3CIQv9lmW/liCdo\nCv7XxSM8dLRWC+8v42zk3S2bOKSe/tcosDDLgbtt09wQqpVgJZtOAJYgsLzAaH2k\n5/7lf7jSc9bKX2u7BAepsuf4tf5ukFGuTEQIjCAUuXIznP/Pq7FUdaMetIeKGfjh\nGJyh2vJw7mSrZpjbhH0Cww==\n-----END PRIVATE KEY-----\n


FIREBASE_APIKEY=AIzaSyCmsqFp19KbH2sWi2LEWzuv1rQm1izUhXU
FIREBASE_AUTH_DOMAIN=senior-citizen-booklet.firebaseapp.com
FIREBASE_PROJECT_ID=senior-citizen-booklet
FIREBASE_STORAGE_BUCKET=senior-citizen-booklet.appspot.com
FIREBASE_MESSENGER_SENDER_ID=1057792626915
FIREBASE_APP_ID=1:1057792626915:web:dbb21eb1d27ec8f248b5d6
FIREBASE_MEASUREMENT_ID=G-VR5ZYTHZPK

PORT=5370

```

---
