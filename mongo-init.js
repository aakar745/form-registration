db.auth('form_user', 'form_password')

db = db.getSiblingDB('formregistration')

// Create user for the formregistration database
db.createUser({
    user: 'form_user',
    pwd: 'form_password',
    roles: [
        {
            role: 'readWrite',
            db: 'formregistration'
        }
    ]
})

// Create some initial collections
db.createCollection('users')
db.createCollection('forms')
