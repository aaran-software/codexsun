working new

-------------------------|---------|----------|---------|---------|--------------------------
File                     | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s        
-------------------------|---------|----------|---------|---------|--------------------------
tenant-resolver.ts     |   86.66 |       50 |     100 |   86.66 | 16,42
db-context-switcher.ts |   84.61 |    47.05 |     100 |   84.61 | 33-34,48,50   


admin@default.com

curl -X POST http://localhost:3006/api/login \
-H "Content-Type: application/json" \
-d '{"email":"admin@default.com","password":"$2b$10$examplehash1"}'

$ curl -X POST http://localhost:3006/api/login \
-H "Content-Type: application/json" \
-d '{"email":"admin@default.com","password":"$2b$10$examplehash1"}'
{"user":{"id":1,"tenantId":"default","role":"admin","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidGVuYW50SWQiOiJkZWZhdWx0Iiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU5ODY1NTk1LCJleHAiOjE3NTk4NjkxOTV9.30IQpPSrFv965vQ6SWxJreu3bc-w5e-zSZQ4CgnY7d0"},"tenant":{"id":"default","dbConnection":"mariadb://root:Computer.1@127.0.0.1:3306/tenant_db"}}


# Test creating a user (requires admin role)
curl -X POST http://localhost:3006/api/users \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidGVuYW50SWQiOiJkZWZhdWx0Iiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU5ODY1NTk1LCJleHAiOjE3NTk4NjkxOTV9.30IQpPSrFv965vQ6SWxJreu3bc-w5e-zSZQ4CgnY7d0" \
-d '{"name":"John Doe","email":"admin@default.com","tenantId":"default"}'