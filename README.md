# License Server Admin - Super Admin Frontend

Super admin login aur company / license management ke liye frontend.

## Run

1. **License Server** pehle chalana: `cd license_server && python manage.py runserver 8002`

2. **Frontend**:

```bash
cd license_server_frontend
npm install
npm run dev
```

3. Browser: http://localhost:3001  
4. Login: superadmin username + password (jo createsuperuser se banaya)

## Features

- Super admin login (username + password)
- Companies list
- Add company
- Generate license key
